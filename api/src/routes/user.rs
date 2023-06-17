use actix_web::{get, web::Data, HttpRequest, HttpResponse, Responder};

use crate::{utils, AppState};

#[get("/user/top_level_folder")]
pub async fn get_top_level_folder(data: Data<AppState>, req: HttpRequest) -> impl Responder {
    let user_id = utils::get_user_id(&req).unwrap();

    let user = sqlx::query!("SELECT flashcards FROM app_user WHERE id = $1", user_id)
        .fetch_one(data.db_pool.as_ref())
        .await
        .unwrap();

    HttpResponse::Ok().json(user.flashcards)
}
