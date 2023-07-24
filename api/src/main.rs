use std::{env, sync::Arc};

use actix_cors::Cors;
use actix_web::{http, web::Data, App, HttpServer};
use actix_web_httpauth::middleware::HttpAuthentication;
use auth::validator;
use routes::{
    flashcard::{add_flashcard, get_flashcard},
    folder::{add_folder, rename_folder, resolve_path},
    group::{
        accept_request, add_group, group_info, group_root_folder, group_search, join_group,
        leave_group,
    },
    user::{get_groups, get_subfolders, get_top_level_folder},
};
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};

mod auth;
mod routes;
mod struct_annotations;
mod utils;

#[derive(Clone, Debug)]
pub struct AppState {
    db_pool: Arc<Pool<Postgres>>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    let db_url = env::var("DATABASE_URL").unwrap();
    let db_pool = Arc::new(
        PgPoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .unwrap(),
    );

    sqlx::migrate!()
        .run(db_pool.as_ref())
        .await
        .expect("Database migration failed");

    HttpServer::new(move || {
        // TODO: properly configure cors
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_header(http::header::CONTENT_TYPE)
            .allowed_header(http::header::AUTHORIZATION);

        let state = AppState {
            db_pool: db_pool.clone(),
        };

        let auth_db_pool = db_pool.clone();
        let auth = HttpAuthentication::bearer(move |req, creds| {
            validator(auth_db_pool.clone(), req, creds)
        });

        App::new()
            .app_data(Data::new(state))
            .wrap(auth)
            .wrap(cors)
            .service(add_flashcard)
            .service(get_top_level_folder)
            .service(get_subfolders)
            .service(add_folder)
            .service(rename_folder)
            .service(resolve_path)
            .service(get_groups)
            .service(add_group)
            .service(get_flashcard)
            .service(join_group)
            .service(leave_group)
            .service(group_info)
            .service(group_search)
            .service(accept_request)
            .service(group_root_folder)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
