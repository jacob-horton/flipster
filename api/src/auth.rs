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
pub struct JWK {
    alg: String,
    n: String,
    e: String,
}

#[derive(Clone, Debug, Deserialize)]
pub struct JWKS {
    keys: Vec<JWK>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    exp: usize,  // Expiry
    iss: String, // Issuer
    sub: String, // Subject (user ID)
}

async fn fetch_jwks(uri: &str) -> Result<JWKS, Box<dyn Error>> {
    let res = reqwest::get(uri).await?;
    let body = res.text().await?;
    let val: JWKS = serde_json::from_str(&body)?;
    Ok(val)
}

async fn get_sub(token: &str) -> Result<String, Box<dyn Error>> {
    let jwks = fetch_jwks(&env::var("JWKS_URL").expect("No JWKS URL provided")).await?;
    let jwk = jwks
        .keys
        .iter()
        .filter(|k| k.alg == "RS256")
        .next()
        .unwrap();

    let decoding_key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)?;
    let token = decode::<Claims>(token, &decoding_key, &Validation::new(Algorithm::RS256))?;

    if token.claims.iss != env::var("VITE_AUTH_SERVER_URL").expect("No auth server URL provided") {
        return Err(Box::new(InvalidIssuer));
    }

    Ok(token.claims.sub)
}

pub async fn validator(
    db_pool: Arc<PgPool>,
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (actix_web::Error, ServiceRequest)> {
    // Get token from creds
    let jwt = credentials.token();

    match get_sub(jwt).await {
        Ok(sub) => {
            let user = sqlx::query!("SELECT id FROM app_user WHERE jwt_sub = $1", sub)
                .fetch_one(db_pool.as_ref())
                .await
                .ok();

            let mut req = req; // Make mutable
            let headers = req.headers_mut();
            headers.insert(
                HeaderName::from_lowercase(b"sub").unwrap(),
                HeaderValue::from_str(&sub).unwrap(),
            );

            if let Some(user) = user {
                headers.insert(
                    HeaderName::from_lowercase(b"user_id").unwrap(),
                    HeaderValue::from(user.id),
                );
            }
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
