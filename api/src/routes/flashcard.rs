use actix_web::{
    get, post,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};

use crate::{
    exportable,
    routes::folder::{get_folder_owner, get_user_permissions, FolderOwner},
    utils, AppState,
};

exportable! {
    pub struct FlashcardInsert {
        term: String,
        definition: String,
        folder_id: i32,
    }
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
        Some(FolderOwner::User(id)) => {
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
        // Owned by different entity
        Some(_) => HttpResponse::Unauthorized().body("Folder is not owned by this user"),
        // Not owned by anything/one
        None => HttpResponse::Unauthorized().body("Folder is not owned by this user"),
    }
}

exportable! {
    pub struct FlashcardGet {
        folder_id: i32
    }
}

exportable! {
    pub struct Flashcard {
        id: i32,
        term: String,
        definition: String,
    }
}

#[get("/flashcard/get")]
pub async fn get_flashcard(
    data: Data<AppState>,
    info: web::Query<FlashcardGet>,
    req: HttpRequest,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();
    if !get_user_permissions(info.folder_id, user_id, &data.db_pool)
        .await
        .read_flashcard
    {
        return HttpResponse::Unauthorized()
            .body("User does not have permission to view this flashcard");
    }

    let flashcards = sqlx::query_as!(
        Flashcard,
        "SELECT id, term, definition FROM flashcard WHERE folder_id = $1",
        info.folder_id
    )
    .fetch_all(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().json(flashcards)
}
