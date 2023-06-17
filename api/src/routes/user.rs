use actix_web::{
    get,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};
use serde::{Deserialize, Serialize};

use crate::{routes::folder::get_folder_owner, utils, AppState};

#[get("/user/top_level_folder")]
pub async fn get_top_level_folder(data: Data<AppState>, req: HttpRequest) -> impl Responder {
    let user_id = utils::get_user_id(&req).unwrap();

    let user = sqlx::query!("SELECT flashcards FROM app_user WHERE id = $1", user_id)
        .fetch_one(data.db_pool.as_ref())
        .await
        .unwrap();

    HttpResponse::Ok().json(user.flashcards)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubFolderGet {
    folder_id: i32,
}

#[get("/user/sub_folders")]
pub async fn get_subfolders(
    data: Data<AppState>,
    req: HttpRequest,
    info: web::Query<SubFolderGet>,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();
    let owner = get_folder_owner(info.folder_id, data.db_pool.as_ref()).await;

    if Some(user_id) != owner {
        return HttpResponse::Unauthorized().body("User does not own that folder");
    }

    let folders = sqlx::query!(
        "SELECT name FROM folder WHERE parent_id = $1",
        info.folder_id
    )
    .fetch_all(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().json(folders.iter().map(|f| f.name.clone()).collect::<Vec<_>>())
}
