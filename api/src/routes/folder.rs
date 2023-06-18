use actix_web::{
    post,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};
use sqlx::PgPool;

use crate::{exportable, utils, AppState};

pub async fn get_folder_owner(folder_id: i32, db_pool: &PgPool) -> Option<i32> {
    let top_level_folder = sqlx::query!(
        "WITH RECURSIVE f AS(
          SELECT id, parent_id FROM folder WHERE id = $1
          UNION
	        SELECT folder.id as id, folder.parent_id as parent_id FROM f, folder WHERE folder.id = f.parent_id
        ) SELECT * FROM f WHERE parent_id IS NULL",
        folder_id
    ).fetch_one(db_pool).await.ok()?.id;

    Some(
        sqlx::query!(
            "SELECT id FROM app_user WHERE flashcards = $1",
            top_level_folder
        )
        .fetch_one(db_pool)
        .await
        .ok()?
        .id,
    )
}

exportable! {
    pub struct SubFolderInsert {
        name: String,
        parent_folder_id: i32,
    }
}

#[post("/folder/add")]
pub async fn add_folder(
    data: Data<AppState>,
    payload: web::Json<SubFolderInsert>,
    req: HttpRequest,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();
    let owner = get_folder_owner(payload.parent_folder_id, data.db_pool.as_ref()).await;

    if Some(user_id) != owner {
        return HttpResponse::Unauthorized().body("User does not own that folder");
    }

    sqlx::query!(
        "INSERT INTO folder (name, parent_id) VALUES ($1, $2)",
        payload.name,
        payload.parent_folder_id
    )
    .execute(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().body("Folder insert successful")
}
