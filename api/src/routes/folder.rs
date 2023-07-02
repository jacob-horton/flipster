use actix_web::{
    get, post,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};
use regex::Regex;
use sqlx::PgPool;

use crate::{exportable, utils, AppState};

exportable! {
    pub struct Folder {
        pub id: i32,
        pub name: String,
    }
}

pub async fn get_folder_owner(folder_id: i32, db_pool: &PgPool) -> Option<i32> {
    let top_level_folder = sqlx::query_scalar!(
        "WITH RECURSIVE f AS(
          SELECT id, parent_id FROM folder WHERE id = $1
          UNION
	        SELECT folder.id as id, folder.parent_id as parent_id FROM f, folder WHERE folder.id = f.parent_id
        ) SELECT id FROM f WHERE parent_id IS NULL",
        folder_id
    ).fetch_one(db_pool).await.ok()?;

    Some(
        sqlx::query_scalar!(
            "SELECT id FROM app_user WHERE flashcards = $1",
            top_level_folder
        )
        .fetch_one(db_pool)
        .await
        .ok()?,
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
    // TODO: do not allow symbols?
    let user_id: i32 = utils::get_user_id(&req).unwrap();
    let owner = get_folder_owner(payload.parent_folder_id, data.db_pool.as_ref()).await;

    if Some(user_id) != owner {
        return HttpResponse::Unauthorized().body("User does not own that folder");
    }

    let result = sqlx::query_as!(
        Folder,
        "INSERT INTO folder (name, parent_id) VALUES ($1, $2) RETURNING id, name",
        payload.name,
        payload.parent_folder_id
    )
    .fetch_one(data.db_pool.as_ref())
    .await;

    match result {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(sqlx::Error::Database(e)) => {
            if let Some("unqiue_name_chk") = e.constraint() {
                return HttpResponse::Conflict()
                    .body(format!("Already have folder with name {}", payload.name));
            }
            HttpResponse::InternalServerError().body("Unrecognised database error")
        }
        _ => HttpResponse::InternalServerError().body("Unrecognised database error"),
    }
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

    let result = sqlx::query_as!(
        Folder,
        "UPDATE folder SET name = $1 WHERE id = $2 RETURNING id, name",
        payload.new_name,
        payload.folder_id
    )
    .fetch_one(data.db_pool.as_ref())
    .await;

    match result {
        Ok(folder) => HttpResponse::Ok().json(folder),
        Err(sqlx::Error::Database(e)) => {
            if let Some("unqiue_name_chk") = e.constraint() {
                return HttpResponse::Conflict().body(format!(
                    "Already have folder with name {}",
                    payload.new_name
                ));
            }
            HttpResponse::InternalServerError().body("Unrecognised database error")
        }
        _ => HttpResponse::InternalServerError().body("Unrecognised database error"),
    }
}

exportable! {
    pub struct ResolvePathGet {
        path: String,
    }
}

#[derive(Debug, Clone)]
pub struct FolderWithParent {
    pub id: i32,
    pub name: String,
    pub parent_id: Option<i32>,
}

#[get("/folder/resolve_path")]
pub async fn resolve_path(
    data: Data<AppState>,
    info: web::Query<ResolvePathGet>,
    req: HttpRequest,
) -> impl Responder {
    // TODO: Use query builder to avoid rust processing? https://stackoverflow.com/questions/74956100/how-to-build-safe-dynamic-query-with-sqlx-in-rust
    let user_id: i32 = utils::get_user_id(&req).unwrap();
    let mut path: Vec<&str> = info.path.split('/').filter(|x| !x.is_empty()).collect();
    path.reverse(); // Reversed path to make popping easier

    let all_folders: Vec<FolderWithParent> = sqlx::query!(
        "WITH RECURSIVE f AS(
          SELECT id, name, parent_id FROM folder WHERE id = (SELECT flashcards FROM app_user WHERE app_user.id = $1)
          UNION
          SELECT folder.id, folder.name, folder.parent_id FROM f, folder WHERE folder.name = ANY($2) AND folder.parent_id = f.id
        ) SELECT * FROM f",
        user_id,
        &path.iter().map(|f| f.to_string()).collect::<Vec<_>>()
    ).fetch_all(data.db_pool.as_ref()).await.unwrap().into_iter().map(|r| FolderWithParent {id: r.id.unwrap(), name: r.name.unwrap(), parent_id: r.parent_id}).collect();

    let mut resolved_path = vec![all_folders[0].clone()];
    for folder in all_folders {
        if path.is_empty() {
            break;
        }

        if let Some(parent_id) = folder.parent_id {
            if parent_id == resolved_path.last().unwrap().id && &folder.name == path.last().unwrap()
            {
                resolved_path.push(folder);
                path.pop();
            }
        }
    }

    let result = resolved_path
        .into_iter()
        .map(|f| Folder {
            id: f.id,
            name: f.name,
        })
        .collect::<Vec<_>>();

    HttpResponse::Ok().json(result)
}

exportable! {
    pub struct UniqueNameGet {
        name: String,
        parent_folder_id: i32
    }
}

#[get("/folder/get_unique_name")]
pub async fn get_unique_folder_name(
    data: Data<AppState>,
    info: web::Query<UniqueNameGet>,
    req: HttpRequest,
) -> impl Responder {
    let user_id: i32 = utils::get_user_id(&req).unwrap();

    // Search for names of format `<info.name>[ (<any number>)]` where the bit in square brackets is
    // optional
    let regex = Regex::new(&format!(r"^{}( \((\d+)\))?$", regex::escape(&info.name))).unwrap();

    if Some(user_id) != get_folder_owner(info.parent_folder_id, &data.db_pool).await {
        return HttpResponse::Unauthorized().body("User does not own that parent folder");
    }

    let numbers: Vec<i32> = sqlx::query!(
        "SELECT name
        FROM folder
        WHERE parent_id = $1",
        info.parent_folder_id,
    )
    .fetch_all(data.db_pool.as_ref())
    .await
    .unwrap()
    .into_iter()
    .filter_map(|r| {
        let caps = regex.captures(&r.name)?;
        return Some(caps.get(2).map_or(1, |cap| cap.as_str().parse().unwrap()));
    })
    .collect();

    let max = numbers.iter().max();

    match max {
        Some(max) => HttpResponse::Ok().body(format!("{} ({})", info.name, max + 1)),
        None => HttpResponse::Ok().body(info.name.clone()),
    }
}
