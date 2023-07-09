import { getRequest } from "./apiRequest";
import { Flashcard } from "./types/Flashcard";
import { FlashcardGet } from "./types/FlashcardGet";

export async function getFlashcards(token: string, folderId: number) {
    const flashcardGet: FlashcardGet = {
        folderId,
    };
    const resp = await getRequest({
        path: "/flashcard/get",
        id_token: token,
        queryParams: flashcardGet,
    });
    if (resp.status == 401) {
        throw Error("User requested flashcards from folder they do not own");
    }
    return (await resp.json()) as Flashcard[];
}
