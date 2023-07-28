use actix_web::{
    get,
    web::{self, Data},
    HttpRequest, HttpResponse, Responder,
};

use crate::{exportable, AppState};

exportable! {
    #[derive(Copy, PartialEq, Eq)]
    enum Mode {
        Flip,
        Match,
        Learn,
    }
}

// TODO: implement vec parser
exportable! {
    pub struct NextFlashcardGetReq {
        modes: String,
        flashcard_ids: String
    }
}

// TODO: currently using String = comma separated list
exportable! {
    pub struct NextFlashcardGetResp {
        mode: Mode,
        flashcard_ids: String
    }
}

fn example_algorithm(modes: Vec<Mode>, flashcard_ids: Vec<i32>) -> Option<(Mode, String)> {
    Some((*modes.first()?, flashcard_ids.first()?.to_string()))
}

#[get("/review/next")]
pub async fn get_next_flashcard(
    _data: Data<AppState>,
    info: web::Query<NextFlashcardGetReq>,
    _req: HttpRequest,
) -> impl Responder {
    let modes = info
        .modes
        .split(',')
        .map(|x| match x {
            "flip" => Some(Mode::Flip),
            "match" => Some(Mode::Match),
            "learn" => Some(Mode::Learn),
            _ => None,
        })
        .collect::<Option<Vec<_>>>();
    let flashcard_ids = info
        .flashcard_ids
        .split(',')
        .map(|x| x.parse::<i32>())
        .collect::<Result<Vec<_>, _>>();

    let (modes, flashcard_ids) = match (modes, flashcard_ids) {
        (None, _) => return HttpResponse::BadRequest().body("Received unknown revision mode."),
        (_, Err(_)) => {
            return HttpResponse::BadRequest().body("Error parsing flashcard IDs as i32s.")
        }
        (Some(modes), Ok(flashcard_ids)) => (modes, flashcard_ids),
    };

    match example_algorithm(modes, flashcard_ids) {
        Some((mode, flashcard_ids)) => HttpResponse::Ok().json(NextFlashcardGetResp {
            mode,
            flashcard_ids,
        }),
        None => HttpResponse::InternalServerError()
            .body("Algorithm failed to get mode or flashcard ids."),
    }
}
