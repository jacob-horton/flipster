use actix_web::{
    get, post,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};

use crate::{
    exportable,
    routes::folder::get_user_permissions,
    utils::{self, get_user_id},
    AppState,
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
    let user_id = get_user_id(&req).unwrap();
    let permissions = get_user_permissions(payload.folder_id, user_id, data.db_pool.as_ref()).await;

    if permissions.add_flashcards {
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
            Err(_) => HttpResponse::InternalServerError().body("Failed to add flashcard"),
        }
    } else {
        HttpResponse::Unauthorized().body("User does not have permission to add a flashcard")
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
        .read_flashcards
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

exportable! {
    pub struct FlashcardFromIDGet {
        flashcard_id: i32
    }
}

exportable! {
    pub struct FlashcardFromIDResp {
        folder_id: i32,
        term: String,
        definition: String
    }
}

#[get("/flashcard/fromid")]
pub async fn get_flashcard_from_id(
    data: Data<AppState>,
    info: web::Query<FlashcardFromIDGet>,
    req: HttpRequest,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();
    let flashcards = sqlx::query_as!(
        FlashcardFromIDResp,
        "SELECT folder_id, term, definition FROM flashcard WHERE id = $1",
        info.flashcard_id
    )
    .fetch_all(data.db_pool.as_ref())
    .await
    .expect("Could not find flashcard");
    let flashcard = flashcards.first().expect("Could not find flashcard");

    if !get_user_permissions(flashcard.folder_id, user_id, &data.db_pool)
        .await
        .read_flashcards
    {
        return HttpResponse::Unauthorized()
            .body("User does not have permission to view this flashcard");
    }

    HttpResponse::Ok().json(flashcard)
}
