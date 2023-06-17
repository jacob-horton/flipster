use actix_web::{
    web::{self, Data},
    HttpRequest, HttpResponse, Responder, post,
};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{utils, AppState};

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../web/src/types/")]
pub struct SubFolderInsert {
    name: String,
    parent_folder_id: i32
}

//TODO check user owns folder

#[post("/folder/add")]
pub async fn add_folder(
    data: Data<AppState>,
    payload: web::Json<SubFolderInsert>,
    req: HttpRequest,
) -> impl Responder {
    println!("{payload:?}");
    let user_id: i32 = utils::get_user_id(&req).unwrap();

    sqlx::query!(
        "INSERT INTO folder (name, parent_id) VALUES ($1, $2)", 
        payload.name, payload.parent_folder_id
    )
    .execute(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().body("Folder insert successful")
}