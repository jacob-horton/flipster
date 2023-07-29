use core::fmt;
use std::{env, error::Error, sync::Arc};

use actix_web::dev::ServiceRequest;
use actix_web_httpauth::extractors::{
    bearer::{self, BearerAuth},
    AuthenticationError,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use reqwest::{
    self,
    header::{HeaderName, HeaderValue},
};
use sqlx::PgPool;

use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone)]
struct InvalidIssuer;
impl Error for InvalidIssuer {}
impl fmt::Display for InvalidIssuer {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "InvalidIssuer")
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct Jwk {
    alg: String,
    n: String,
    e: String,
}

#[derive(Clone, Debug, Deserialize)]
pub struct Jwks {
    keys: Vec<Jwk>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    exp: usize,                 // Expiry
    iss: String,                // Issuer
    sub: String,                // Subject (user ID)
    given_name: String,         // First name
    family_name: String,        // Last name
    preferred_username: String, // Username
}

async fn fetch_jwks(uri: &str) -> Result<Jwks, Box<dyn Error>> {
    let res = reqwest::get(uri).await?;
    let body = res.text().await?;
    let val: Jwks = serde_json::from_str(&body)?;
    Ok(val)
}

async fn get_claims(token: &str) -> Result<Claims, Box<dyn Error>> {
    let jwks = fetch_jwks(&env::var("JWKS_URL").expect("No JWKS URL provided")).await?;
    let jwk = jwks.keys.iter().find(|k| k.alg == "RS256").unwrap();

    let decoding_key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)?;
    let token = decode::<Claims>(token, &decoding_key, &Validation::new(Algorithm::RS256))?;

    if token.claims.iss != env::var("NEXT_PUBLIC_AUTH_URL").expect("No auth server URL provided") {
        return Err(Box::new(InvalidIssuer));
    }

    Ok(token.claims)
}

pub async fn validator(
    db_pool: Arc<PgPool>,
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (actix_web::Error, ServiceRequest)> {
    // Get token from creds
    let jwt = credentials.token();

    match get_claims(jwt).await {
        Ok(claims) => {
            let user_id =
                sqlx::query_scalar!("SELECT id FROM app_user WHERE jwt_sub = $1", claims.sub)
                    .fetch_optional(db_pool.as_ref())
                    .await
                    .expect("Failed to search for user");

            let mut req = req; // Make mutable
            let headers = req.headers_mut();
            headers.insert(
                HeaderName::from_lowercase(b"sub").unwrap(),
                HeaderValue::from_str(&claims.sub).unwrap(),
            );

            let user_id = match user_id {
                Some(user_id) => user_id,
                None => {
                    // TODO: extract creating account into another function
                    let tlf = sqlx::query_scalar!(
                        "INSERT INTO folder (name) VALUES ('Your Files') RETURNING id",
                    )
                    .fetch_one(db_pool.as_ref())
                    .await
                    .expect("Failed to create folder for new user");

                    sqlx::query_scalar!(
                            "INSERT INTO app_user (first_name, last_name, username, top_level_folder, jwt_sub) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                            claims.given_name,
                            claims.family_name,
                            claims.preferred_username,
                            tlf,
                            claims.sub)
                        .fetch_one(db_pool.as_ref())
                        .await
                        .expect("Failed to insert new user")
                }
            };

            headers.insert(
                HeaderName::from_lowercase(b"user_id").unwrap(),
                HeaderValue::from(user_id),
            );

            Ok(req)
        }
        Err(_) => {
            let config = req
                .app_data::<bearer::Config>()
                .cloned()
                .unwrap_or_default();

            Err((AuthenticationError::from(config).into(), req))
        }
    }
}
