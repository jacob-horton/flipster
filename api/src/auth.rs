use std::sync::Arc;

use actix_web::dev::ServiceRequest;
use actix_web_httpauth::extractors::{
    bearer::{self, BearerAuth},
    AuthenticationError,
};
use reqwest::{
    self,
    header::{HeaderName, HeaderValue},
};
use sqlx::PgPool;

use serde::Deserialize;
use serde::Serialize;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JwtResponse {
    pub iss: String,
    pub nbf: String,
    pub aud: String,
    pub sub: String,
    pub email: String,
    #[serde(rename = "email_verified")]
    pub email_verified: String,
    pub azp: String,
    pub name: String,
    pub picture: String,
    #[serde(rename = "given_name")]
    pub given_name: String,
    pub iat: String,
    pub exp: String,
    pub jti: String,
    pub alg: String,
    pub kid: String,
    pub typ: String,
}

async fn get_email(token: &str) -> Result<String, ()> {
    let client = reqwest::Client::new();
    let result = client
        .get("https://oauth2.googleapis.com/tokeninfo")
        .query(&vec![("id_token", token)])
        .send()
        .await
        .map_err(|_| ())?;

    let parsed: JwtResponse =
        serde_json::from_str(&result.text().await.map_err(|_| ())?).map_err(|_| ())?;
    Ok(parsed.email)
}

pub async fn validator(
    db_pool: Arc<PgPool>,
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (actix_web::Error, ServiceRequest)> {
    // Get token from creds
    let jwt = credentials.token();

    // TODO: Verify without contacting google: https://ncona.com/2015/02/consuming-a-google-id-token-from-a-server/
    // Make request to https://oauth2.googleapis.com/tokeninfo?id_token=<id>
    match get_email(jwt).await {
        Ok(email) => {
            let user = sqlx::query!("SELECT id FROM app_user WHERE email = $1", email)
                .fetch_one(db_pool.as_ref())
                .await
                .ok();

            let mut req = req; // Make mutable
            let headers = req.headers_mut();
            headers.insert(
                HeaderName::from_lowercase(b"email").unwrap(),
                HeaderValue::from_str(&email).unwrap(),
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
