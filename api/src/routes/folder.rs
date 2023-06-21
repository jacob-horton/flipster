use actix_web::{
    get, post,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};
use sqlx::PgPool;

use crate::{exportable, routes::user::Folder, utils, AppState};

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

    let id = sqlx::query!(
        "INSERT INTO folder (name, parent_id) VALUES ($1, $2) RETURNING id",
        payload.name,
        payload.parent_folder_id
    )
    .fetch_one(data.db_pool.as_ref())
    .await
    .unwrap()
    .id;

    HttpResponse::Ok().body(id.to_string())
}

exportable! {
    pub struct SubFolderRename {
        new_name: String,
        folder_id: i32,
    }
}

#[post("/folder/rename")]
pub async fn rename_folder(
    data: Data<AppState>,
    payload: web::Json<SubFolderRename>,
    req: HttpRequest,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();
    let owner = get_folder_owner(payload.folder_id, data.db_pool.as_ref()).await;

    if Some(user_id) != owner {
        return HttpResponse::Unauthorized().body("User does not own that folder");
    }

    let folder = sqlx::query!(
        "UPDATE folder SET name = $1 WHERE id = $2 RETURNING id, name",
        payload.new_name,
        payload.folder_id
    )
    .fetch_one(data.db_pool.as_ref())
    .await
    .unwrap();

    HttpResponse::Ok().json(Folder {
        name: folder.name,
        id: folder.id,
    })
}

exportable! {
    pub struct ResolvePathGet {
        path: String,
    }
}

#[get("/folder/resolve_path")]
pub async fn resolve_path(
    data: Data<AppState>,
    info: web::Query<ResolvePathGet>,
    req: HttpRequest,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();
    let path: Vec<&str> = info.path.split("/").filter(|x| x.len() > 0).collect();

    let top_level_folder = sqlx::query!(
        "SELECT folder.name, folder.id
        FROM app_user
        INNER JOIN folder ON folder.id = app_user.flashcards
        WHERE app_user.id = $1",
        user_id
    )
    .fetch_one(data.db_pool.as_ref())
    .await
    .unwrap();

    let top_level_folder = Folder {
        id: top_level_folder.id,
        name: String::from("Your files"),
    };

    // If requesting top level folder, return it here
    if path.len() == 0 {
        return HttpResponse::Ok().json(&[top_level_folder]);
    }

    let mut result = Vec::new();

    let mut i = 0;
    let mut current_folder = Some(top_level_folder);

    while let Some(folder) = current_folder {
        result.push(folder.clone());

        if i == path.len() {
            break;
        }

        // TODO: handle path wrong
        current_folder = sqlx::query!(
            "SELECT id, name FROM folder WHERE parent_id = $1 AND name = $2",
            folder.id,
            &path.get(i).unwrap()
        )
        .fetch_optional(data.db_pool.as_ref())
        .await
        .unwrap()
        .map(|r| Folder {
            id: r.id,
            name: r.name,
        });

        i += 1;
    }

    HttpResponse::Ok().json(result)
}
