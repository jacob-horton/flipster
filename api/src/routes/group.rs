use crate::routes::folder::get_user_permissions;
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
    while sqlx::query_scalar!(
        "SELECT uuid FROM app_group WHERE uuid = $1 LIMIT 1",
        uuid.to_string()
    )
    .fetch_optional(data.db_pool.as_ref())
    .await
    .unwrap()
    .is_some()
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
    pub struct GroupInfoGetReq {
        uuid: String,
    }
}

exportable! {
    pub struct UserDetails {
        id: i32,
        first_name: String,
        last_name: String,
    }
}

exportable! {
    pub struct MemberDetails {
        id: i32,
        first_name: String,
        last_name: String,
        role: MemberType,
    }
}

exportable! {
    pub struct GroupInfoGetResp {
        uuid: String,
        name: String,
        root_folder: Option<i32>,
        is_public: bool,
        member_type: Option<MemberType>,
        is_request_pending: bool,
        members: Vec<MemberDetails>,
        requests: Option<Vec<UserDetails>>,
    }
}

#[get("/group/info")]
pub async fn group_info(
    data: Data<AppState>,
    info: web::Query<GroupInfoGetReq>,
    req: HttpRequest,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();

    let group_info_future = sqlx::query!(
        "SELECT name, top_level_folder, is_public FROM app_group WHERE uuid = $1",
        info.uuid,
    )
    .fetch_one(data.db_pool.as_ref());

    let member_type_future = sqlx::query_scalar!(
        r#"SELECT group_member.role as "role: MemberType" FROM group_member JOIN app_group ON group_member.app_group_id = app_group.id WHERE app_group.uuid = $1 AND group_member.app_user_id = $2"#,
        info.uuid,
        user_id,
    )
    .fetch_optional(data.db_pool.as_ref());

    let request_future = sqlx::query_scalar!(
        "SELECT join_request.id FROM join_request JOIN app_group ON app_group.id = join_request.app_group_id WHERE app_group.uuid = $1 AND join_request.app_user_id = $2",
        info.uuid,
        user_id,
    )
    .fetch_optional(data.db_pool.as_ref());

    let members_future = sqlx::query_as!(
        MemberDetails,
        r#"SELECT app_user.id, app_user.first_name, app_user.last_name, group_member.role as "role: MemberType"
        FROM app_user
        JOIN group_member ON group_member.app_user_id = app_user.id
        JOIN app_group ON app_group.id = group_member.app_group_id
        WHERE app_group.uuid = $1"#,
        info.uuid
    )
    .fetch_all(data.db_pool.as_ref());

    let requests_future = sqlx::query_as!(
        UserDetails,
        "SELECT app_user.id, app_user.first_name, app_user.last_name
        FROM app_user
        JOIN join_request ON join_request.app_user_id = app_user.id
        JOIN app_group ON app_group.id = join_request.app_group_id
        WHERE app_group.uuid = $1",
        info.uuid
    )
    .fetch_all(data.db_pool.as_ref());

    let (group_info, member_type, request, members, requests) = futures::join!(
        group_info_future,
        member_type_future,
        request_future,
        members_future,
        requests_future
    );

    let member_type = member_type.unwrap();
    let requests = match member_type {
        Some(MemberType::Admin) | Some(MemberType::Owner) => Some(requests.unwrap()),
        _ => None,
    };

    let group_info = group_info.unwrap();
    let permissions =
        get_user_permissions(group_info.top_level_folder, user_id, &data.db_pool).await;

    let root_folder = if permissions.read_folders {
        Some(group_info.top_level_folder)
    } else {
        None
    };

    let group_details = GroupInfoGetResp {
        uuid: info.uuid.clone(),
        name: group_info.name,
        root_folder,
        is_public: group_info.is_public,
        member_type,
        is_request_pending: request.unwrap().is_some(),
        members: members.unwrap(),
        requests,
    };

    HttpResponse::Ok().json(group_details)
}

exportable! {
    pub struct GroupJoinPostReq {
        uuid: String,
    }
}

#[post("/group/join")]
pub async fn join_group(
    data: Data<AppState>,
    info: web::Json<GroupJoinPostReq>,
    req: HttpRequest,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();

    let group = sqlx::query!(
        "SELECT id, is_public
        FROM app_group
        WHERE uuid = $1",
        info.uuid,
    )
    .fetch_one(data.db_pool.as_ref())
    .await
    .unwrap();

    let member = sqlx::query!(
        "SELECT app_group_id FROM group_member WHERE app_group_id = $1 AND app_user_id = $2 LIMIT 1",
        group.id,
        user_id
    )
    .fetch_optional(data.db_pool.as_ref())
    .await
    .unwrap();

    match member {
        // TODO: Proper HTTP response status
        Some(_) => HttpResponse::Conflict().body("User is already a member of this group"),
        None => {
            if group.is_public {
                sqlx::query!(
                    "INSERT INTO group_member (app_group_id, app_user_id, role) VALUES ($1, $2, $3)",
                    group.id,
                    user_id,
                    MemberType::Member as MemberType
                )
                .execute(data.db_pool.as_ref())
                .await
                .unwrap();

                HttpResponse::Ok().body("Successfully joined group!")
            } else {
                sqlx::query!(
                    "INSERT INTO join_request (app_group_id, app_user_id) VALUES ($1, $2)",
                    group.id,
                    user_id
                )
                .execute(data.db_pool.as_ref())
                .await
                .unwrap();

                HttpResponse::Ok().body("Invite sent")
            }
        }
    }
}

exportable! {
    pub struct GroupLeavePostReq {
        uuid: String,
    }
}

#[post("/group/leave")]
pub async fn leave_group(
    data: Data<AppState>,
    info: web::Json<GroupLeavePostReq>,
    req: HttpRequest,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();

    // TODO: prevent owner leaving
    let group_id = sqlx::query_scalar!("SELECT id FROM app_group WHERE uuid = $1", info.uuid)
        .fetch_one(data.db_pool.as_ref())
        .await
        .unwrap();

    sqlx::query!(
        "DELETE FROM group_member WHERE app_group_id = $1 AND app_user_id = $2",
        group_id,
        user_id
    )
    .execute(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().body("Successfully left group")
}

exportable! {
    pub struct AcceptRequestPostReq {
        group_uuid: String,
        user_id: i32,
    }
}

#[post("/group/accept_request")]
pub async fn accept_request(
    data: Data<AppState>,
    info: web::Json<AcceptRequestPostReq>,
    req: HttpRequest,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();

    let group = sqlx::query!(
        "SELECT id, is_public
        FROM app_group
        WHERE uuid = $1",
        info.group_uuid,
    )
    .fetch_one(data.db_pool.as_ref())
    .await
    .unwrap();

    let member = sqlx::query_scalar!(
        r#"SELECT role as "role: MemberType" FROM group_member WHERE app_group_id = $1 AND app_user_id = $2 LIMIT 1"#,
        group.id,
        user_id
    )
    .fetch_optional(data.db_pool.as_ref())
    .await
    .unwrap();

    match member {
        Some(MemberType::Owner | MemberType::Admin) => {
            let group = sqlx::query_scalar!(
                "SELECT app_group.id FROM join_request JOIN app_group ON app_group.id = join_request.app_group_id WHERE app_user_id = $1 AND app_group.uuid = $2 LIMIT 1",
                info.user_id,
                info.group_uuid
            )
            .fetch_optional(data.db_pool.as_ref())
            .await
            .unwrap();

            match group {
                Some(id) => {
                    // TODO: transaction
                    sqlx::query!("INSERT INTO group_member (app_user_id, app_group_id, role) VALUES ($1, $2, $3)", info.user_id, id, MemberType::Member as MemberType).execute(data.db_pool.as_ref()).await.unwrap();
                    sqlx::query!(
                        "DELETE FROM join_request WHERE app_user_id = $1 AND app_group_id = $2",
                        info.user_id,
                        id,
                    )
                    .execute(data.db_pool.as_ref())
                    .await
                    .unwrap();

                    HttpResponse::Ok().body("User successfully invited")
                }
                None => HttpResponse::BadRequest().body("Request does not exist"),
            }
        }
        _ => HttpResponse::Unauthorized()
            .body("User is not authorised to accept an invite for this group"),
    }
}

exportable! {
    pub struct GroupSearchGetReq {
        search_term: String,
        #[ts(optional)]
        n: Option<i64>,
    }
}

exportable! {
    pub struct GroupSearchGetResp {
        name: String,
        uuid: String,
    }
}

#[get("/group/search")]
pub async fn group_search(
    data: Data<AppState>,
    info: web::Query<GroupSearchGetReq>,
) -> impl Responder {
    // TODO: Index name with b-tree? Won't do anything if % before search term?
    // `strpos` will return non-zero number if the substring exists in the string
    // This can be faster and prevents having to escape `%` or `_` in `LIKE` query
    // Source: https://dba.stackexchange.com/questions/261412/postgresql-prevent-sql-injection-for-like-query-with-input
    // `lower` allows for case insensitive search
    let groups = sqlx::query_as!(
        GroupSearchGetResp,
        "SELECT name, uuid FROM app_group WHERE STRPOS(lower(name), lower($1)) > 0 LIMIT $2",
        info.search_term,
        info.n.unwrap_or(20)
    )
    .fetch_all(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().json(groups)
}
