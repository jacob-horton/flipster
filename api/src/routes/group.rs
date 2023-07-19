use actix_web::{
    get, post,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};
use uuid::Uuid;

use crate::{enum_type, exportable, utils, AppState};

exportable! {
    pub struct GroupInsert {
        name: String,
        description: String,
        is_public: bool,
    }
}

enum_type! {
    #[sqlx(type_name = "member_type")]
    pub enum MemberType {
        Viewer,
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

    let tlf = sqlx::query_scalar!("INSERT INTO folder (name) VALUES ('Files') RETURNING id")
        .fetch_one(data.db_pool.as_ref())
        .await
        .expect("Failed to create folder for new group");

    let mut uuid = Uuid::new_v4();
    while let Some(_) = sqlx::query_scalar!(
        "SELECT uuid FROM app_group WHERE uuid = $1 LIMIT 1",
        uuid.to_string()
    )
    .fetch_optional(data.db_pool.as_ref())
    .await
    .unwrap()
    {
        uuid = Uuid::new_v4();
    }

    let group_id = sqlx::query_scalar!(
        "INSERT INTO app_group (name, description, is_public, top_level_folder, uuid) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        payload.name,
        payload.description,
        payload.is_public,
        tlf,
        uuid.to_string(),
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

exportable! {
    pub struct GroupGetReq {
        uuid: String,
    }
}

exportable! {
    pub struct GroupGetResp {
        id: i32,
        name: String,
        root_folder: i32,
        uuid: String,
    }
}

#[get("/group/get")]
pub async fn get_group(
    data: Data<AppState>,
    info: web::Query<GroupGetReq>,
    req: HttpRequest,
) -> impl Responder {
    // TODO: do not allow symbols?
    let user_id: i32 = utils::get_user_id(&req).unwrap();

    let group = sqlx::query_as!(
        GroupGetResp,
        "SELECT app_group.id, app_group.name, app_group.top_level_folder as root_folder, uuid
        FROM app_group
        JOIN group_member ON group_member.app_group_id = app_group.id
        WHERE app_group.uuid = $1 AND (is_public = true OR group_member.app_user_id = $2)",
        info.uuid,
        user_id,
    )
    .fetch_one(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().json(group)
}
