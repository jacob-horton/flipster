use actix_web::{
    get, post,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};
use regex::Regex;
use sqlx::PgPool;

use crate::{exportable, utils, AppState};

use super::group::MemberType;

exportable! {
    pub struct Folder {
        pub id: i32,
        pub name: String,
    }
}

pub enum FolderOwner {
    User(i32),
    Group(i32),
}

pub async fn get_folder_owner(folder_id: i32, db_pool: &PgPool) -> Option<FolderOwner> {
    let top_level_folder = sqlx::query_scalar!(
        "WITH RECURSIVE f AS(
          SELECT id, parent_id FROM folder WHERE id = $1
          UNION
	        SELECT folder.id as id, folder.parent_id as parent_id FROM f, folder WHERE folder.id = f.parent_id
        ) SELECT id FROM f WHERE parent_id IS NULL",
        folder_id
    ).fetch_one(db_pool).await.ok()?;

    let user_id_future = sqlx::query_scalar!(
        "SELECT id FROM app_user WHERE top_level_folder = $1",
        top_level_folder
    )
    .fetch_optional(db_pool);

    let group_id_future = sqlx::query_scalar!(
        "SELECT id FROM app_group WHERE top_level_folder = $1",
        top_level_folder
    )
    .fetch_optional(db_pool);

    let (user_id, group_id) = futures::join!(user_id_future, group_id_future);
    let user_id = user_id.unwrap();
    let group_id = group_id.unwrap();

    if let Some(user_id) = user_id {
        return Some(FolderOwner::User(user_id));
    }

    if let Some(group_id) = group_id {
        return Some(FolderOwner::Group(group_id));
    }

    None
}

#[derive(Debug, Clone, Default)]
pub struct ContentPermissions {
    pub add_flashcards: bool,
    pub edit_flashcards: bool,
    pub read_flashcards: bool,

    pub add_folders: bool,
    pub edit_folders: bool,
    pub read_folders: bool,
}

impl ContentPermissions {
    fn none() -> Self {
        Default::default()
    }

    fn all() -> Self {
        ContentPermissions {
            add_folders: true,
            edit_folders: true,
            read_folders: true,

            add_flashcards: true,
            edit_flashcards: true,
            read_flashcards: true,
        }
    }
}

impl From<MemberType> for ContentPermissions {
    fn from(value: MemberType) -> Self {
        match value {
            MemberType::Owner => ContentPermissions::all(),
            MemberType::Admin => ContentPermissions::all(),
            MemberType::Member => ContentPermissions {
                read_folders: true,
                read_flashcards: true,
                add_flashcards: true,
                ..ContentPermissions::none()
            },
            MemberType::Viewer => ContentPermissions {
                read_folders: true,
                read_flashcards: true,
                ..ContentPermissions::none()
            },
        }
    }
}

pub async fn get_user_permissions(
    folder_id: i32,
    user_id: i32,
    db_pool: &PgPool,
) -> ContentPermissions {
    let owner = get_folder_owner(folder_id, db_pool).await;
    match owner {
        Some(FolderOwner::User(id)) => {
            if user_id == id {
                ContentPermissions::all()
            } else {
                ContentPermissions::none()
            }
        }
        Some(FolderOwner::Group(id)) => {
            let is_public =
                sqlx::query_scalar!("SELECT is_public FROM app_group WHERE id = $1", id)
                    .fetch_one(db_pool);

            let member_type = sqlx::query_scalar!(
                r#"SELECT role as "role: MemberType" FROM group_member WHERE app_user_id = $1 AND app_group_id = $2"#,
                user_id,
                id
            )
            .fetch_optional(db_pool);

            let (is_public, member_type) = futures::join!(is_public, member_type);

            if is_public.unwrap() {
                MemberType::Viewer.into()
            } else {
                match member_type.unwrap() {
                    Some(member_type) => member_type.into(),
                    None => ContentPermissions::none(),
                }
            }
        }
        None => ContentPermissions::none(), // Folder does not have owner
    }
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
    if !get_user_permissions(payload.parent_folder_id, user_id, &data.db_pool)
        .await
        .add_folders
    {
        return HttpResponse::Unauthorized().body("User does not have permissions to add folders");
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
                let unique_name =
                    get_unique_folder_name(&payload.name, payload.parent_folder_id, &data.db_pool)
                        .await;

                let result = sqlx::query_as!(
                    Folder,
                    "INSERT INTO folder (name, parent_id) VALUES ($1, $2) RETURNING id, name",
                    unique_name,
                    payload.parent_folder_id
                )
                .fetch_one(data.db_pool.as_ref())
                .await
                .unwrap();

                return HttpResponse::Ok().json(result);
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
    // TODO: Don't allow empty string
    if !get_user_permissions(payload.folder_id, user_id, &data.db_pool)
        .await
        .edit_folders
    {
        return HttpResponse::Unauthorized()
            .body("User does not have permission to edit this folder");
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
          SELECT id, name, parent_id FROM folder WHERE id = (SELECT top_level_folder FROM app_user WHERE app_user.id = $1)
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

pub async fn get_unique_folder_name(name: &str, parent_folder_id: i32, db_pool: &PgPool) -> String {
    // Search for names of format `<info.name>[ (<any number>)]` where the bit in square brackets is
    // optional
    let regex = Regex::new(&format!(r"^{}( \((\d+)\))?$", regex::escape(name))).unwrap();

    // let user_id: i32 = utils::get_user_id(&req).unwrap();
    // if !get_user_permissions(info.parent_folder_id, user_id, &data.db_pool)
    //     .await
    //     .read_folders
    // {
    //     return HttpResponse::Unauthorized()
    //         .body("User does not have permissions to read this folder");
    // }

    let numbers: Vec<i32> = sqlx::query!(
        "SELECT name
        FROM folder
        WHERE parent_id = $1",
        parent_folder_id,
    )
    .fetch_all(db_pool)
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
        Some(max) => format!("{} ({})", name, max + 1),
        None => name.to_string(),
    }
}
