import FlashcardComponent from "@components/routeFiles/FlashcardComponent";
import PageSection, { SectionArticle } from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { Flashcard } from "@src/types/Flashcard";
import { getFlashcards } from "@src/getFlashcards";
import { AuthContextProps, useAuth } from "react-oidc-context";
import FolderListView from "@components/FolderListView";
import { useState } from "react";
import ReviewPopup from "@components/routeReview/ReviewPopup";
import { useQuery } from "@tanstack/react-query";
import getRootFolder from "@src/getRootFolder";
import Button from "@components/Button";
import {
    reviewFidsKey,
    reviewModesKey,
    useSessionStorage,
} from "@src/useStorage";
import { useRouter } from "next/router";
/*
This page allows the user to select flashcards from the list (displayed by 
selecting folders) and modes from the popup to use in a review session.
These will store in sessionStorage and Router will redirect to review/cards/
*/

function calcMaxWidth(flashcardIds: number[]) {
    // deprecated
    const flashcardIdLength = Math.max(...flashcardIds).toString().length;
    return Math.max(6, flashcardIdLength * 2 + 2);
}

async function getAccessedFlashcards(
    auth: AuthContextProps,
    selectedFolders: number[]
) {
    let flashcards: Flashcard[] = [];
    if (!auth.user?.id_token) return flashcards;
    // TODO: this is inefficient. it should be done in one request, or make better
    // usage of QueryCache
    for (const folderId of selectedFolders) {
        flashcards = flashcards.concat(
            await getFlashcards(auth.user.id_token, folderId)
        );
    }
    return flashcards;
}

export default function ReviewIndex() {
    const auth = useAuth();
    const router = useRouter();
    // breaking setState convention to indicate storage?
    const storeReviewModes = useSessionStorage(reviewModesKey, "")[1];
    const storeReviewFIDs = useSessionStorage(reviewFidsKey, "")[1];
    const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
    const [selectedFlashcards, setSelectedFlashcards] = useState<
        Map<number, boolean>
    >(new Map());
    const defaultSelection = true;
    const [showPopup, setShowPopup] = useState(false);

    // TODO: make this the FolderListView default?
    const { data: rootFolder } = useQuery({
        // gets the root folder
        queryKey: ["rootFolder", auth.user],
        queryFn: async () =>
            (await getRootFolder(auth.user?.id_token)) ??
            Promise.reject("Unauthorised"),
        enabled: !!auth.user?.id_token,
    });

    const { data: accessedFlashcards } = useQuery({
        // gets accessed (parent folder selected) flashcards
        queryKey: ["accessedFlashcards", selectedFolders, auth.user?.id_token],
        queryFn: async () => await getAccessedFlashcards(auth, selectedFolders),
        enabled: !!(auth.user?.id_token && selectedFolders),
        keepPreviousData: true,
    });

    // TODO: have a default error page? could send a debug report
    if (!auth.user?.id_token || !rootFolder || !accessedFlashcards) {
        return <ProtectedRoute>{`${accessedFlashcards}`}</ProtectedRoute>;
    }

    const maxWidth = accessedFlashcards
        ? calcMaxWidth(Array.from(accessedFlashcards.keys()))
        : 0;

    // TODO: move into own component
    const foldersArticle = (
        <SectionArticle className="w-full" titleBar="Review">
            <FolderListView
                rootFolder={rootFolder}
                selectMultiple={true}
                selected={selectedFolders}
                setSelected={setSelectedFolders}
            />
        </SectionArticle>
    );
    const flashcards = accessedFlashcards.map((f, i) => {
        const selected = selectedFlashcards.get(f.id) ?? defaultSelection;
        return (
            <FlashcardComponent
                key={f.id}
                flashcard={{
                    ...f,
                    id: i + 1,
                }}
                mode="select"
                selected={selected}
                onClick={() =>
                    setSelectedFlashcards(
                        (prevState) => new Map(prevState.set(f.id, !selected))
                    )
                }
                indexWidth={maxWidth}
            />
        );
    });

    const flashcardsArticle = (
        <SectionArticle
            titleBar="Flashcards"
            className="mb-4 w-full overflow-auto"
        >
            <div className="grow space-y-2">{flashcards}</div>
        </SectionArticle>
    );

    return (
        <div className="flex h-full flex-col items-center p-4">
            <PageSection
                className="min-h-0 w-full grow"
                articles={[foldersArticle, flashcardsArticle]}
            />
            <span className="p-2" />
            <Button
                onClick={() => {
                    accessedFlashcards.some(
                        (f) => selectedFlashcards.get(f.id) ?? defaultSelection
                    )
                        ? setShowPopup(true)
                        : alert("Please select some flashcards to review.");
                }}
            >
                Review
            </Button>
            <ReviewPopup
                show={showPopup}
                onCancel={() => {
                    setShowPopup(false);
                }}
                onSubmit={(_, modes) => {
                    storeReviewModes(modes.join(","));
                    storeReviewFIDs(
                        Array.from(accessedFlashcards, (f) => {
                            return selectedFlashcards.get(f.id) ??
                                defaultSelection
                                ? f.id.toString()
                                : undefined;
                        })
                            .filter((i): i is string => !!i)
                            .join(",")
                    );
                    router.push("/review/cards");
                }}
            />
        </div>
    );
}
