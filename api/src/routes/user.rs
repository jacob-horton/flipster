use actix_web::{
    get,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};

use crate::{
    exportable,
    routes::folder::{get_folder_owner, Folder},
    utils, AppState,
};

use super::group::MemberType;

#[get("/user/top_level_folder")]
pub async fn get_top_level_folder(data: Data<AppState>, req: HttpRequest) -> impl Responder {
    let user_id = utils::get_user_id(&req).unwrap();

    let user = sqlx::query!("SELECT flashcards FROM app_user WHERE id = $1", user_id)
        .fetch_one(data.db_pool.as_ref())
        .await
        .unwrap();

    HttpResponse::Ok().json(user.flashcards)
}

exportable! {
    pub struct SubFolderGet {
        folder_id: i32,
    }
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

    let folders = sqlx::query_as!(
        Folder,
        "SELECT id, name FROM folder WHERE parent_id = $1 ORDER BY name",
        info.folder_id
    )
    .fetch_all(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().json(folders)
}

// exportable! {
//     struct GroupGet {
//         id: i32
//     }
// }

exportable! {
    struct UserGroup {
        id: i32,
        name: String,
        description: String,
        is_public: bool,
        role: MemberType,
    }
}

#[get("/user/groups")]
pub async fn get_groups(
    data: Data<AppState>,
    // info: web::Query<GroupGet>,
    req: HttpRequest,
) -> impl Responder {
    // TODO: do not allow symbols?
    let user_id: i32 = utils::get_user_id(&req).unwrap();

    let groups = sqlx::query_as!(
        UserGroup,
        r#"SELECT
            app_group.id,
            app_group.name,
            app_group.description,
            app_group.is_public,
            group_member.role as "role: MemberType"
        FROM app_group
        INNER JOIN group_member ON app_group.id = group_member.app_group_id
        WHERE app_user_id = $1"#,
        user_id,
    )
    .fetch_all(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().json(groups)
}
