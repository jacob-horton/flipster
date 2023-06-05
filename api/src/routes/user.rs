// #[post("/user/add")]
// pub async fn add_user(
//     data: Data<AppState>,
//     payload: web::Json<UserInsert>,
// ) -> Result<HttpResponse, Error> {
//     let mut transaction = data
//         .db_pool
//         .begin()
//         .await
//         .expect("Failed to create transaction when adding flashcard");
//
//     // Create top level folder for user
//     let folder_id = sqlx::query!(
//         "INSERT INTO folder (name) VALUES ($1) RETURNING id",
//         format!("user_{}_top_level", payload.user_id)
//     )
//     .fetch_one(&mut transaction)
//     .await
//     .expect("Failed to add top level folder for user");
// }
