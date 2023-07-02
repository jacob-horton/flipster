use actix_web::{
    post,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};

use crate::{enum_type, exportable, utils, AppState};

exportable! {
    pub struct GroupInsert {
        name: String,
        description: String,
        is_public: bool,
    }
}

enum_type! {
    pub enum MemberType {
        Member,
        Admin,
        Owner,
    }
}

#[post("/group/add")]
pub async fn add_group(
    data: Data<AppState>,
    payload: web::Json<GroupInsert>,
    req: HttpRequest,
) -> impl Responder {
    // TODO: do not allow symbols?
    let user_id: i32 = utils::get_user_id(&req).unwrap();

    let group_id = sqlx::query_scalar!(
        "INSERT INTO app_group (name, description, is_public) VALUES ($1, $2, $3) RETURNING id",
        payload.name,
        payload.description,
        payload.is_public
    )
    .fetch_one(data.db_pool.as_ref())
    .await
    .unwrap();

    sqlx::query!(
        "INSERT INTO group_member (app_user_id, app_group_id, role) VALUES ($1, $2, $3)",
        user_id,
        group_id,
        MemberType::Owner as MemberType // NOTE: `as` needed here for type checking (https://users.rust-lang.org/t/sqlx-postgres-how-to-insert-a-enum-value/53044/2)
    )
    .execute(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().body("Successfully added group")
}
