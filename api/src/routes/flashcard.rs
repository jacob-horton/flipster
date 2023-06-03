use actix_web::{
    post,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::AppState;

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

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FlashcardInsert {
    term: String,
    definition: String,
    folder_id: i32,
}

#[post("/flashcard/add")]
pub async fn add_flashcard(
    data: Data<AppState>,
    payload: web::Json<FlashcardInsert>,
    req: HttpRequest,
) -> impl Responder {
    // Check who owns the folder
    let folder_owner_id = get_folder_owner(payload.folder_id, data.db_pool.as_ref()).await;
    match folder_owner_id {
        Some(id) => {
            match req.headers().get("user_id") {
                Some(user_id) => {
                    let user_id: i32 = user_id.to_str().unwrap().parse::<i32>().unwrap();

                    // Check the owner is the user trying to add to the folder
                    if user_id != id {
                        return HttpResponse::Unauthorized().body("User does not own this folder");
                    }

                    // Insert flashcard
                    let result = sqlx::query!(
                        "INSERT INTO flashcard (term, definition, folder_id) VALUES ($1, $2, $3)",
                        payload.term,
                        payload.definition,
                        payload.folder_id
                    )
                    .execute(data.db_pool.as_ref())
                    .await;

                    match result {
                        Ok(_) => HttpResponse::Ok().body("Added flashcard successfully"),
                        Err(_) => {
                            HttpResponse::InternalServerError().body("Failed to add flashcard")
                        }
                    }
                }
                None => HttpResponse::Unauthorized().body("User does not exist"),
            }
        }
        None => HttpResponse::Unauthorized().body("Folder is not owned by this user"),
    }
}
