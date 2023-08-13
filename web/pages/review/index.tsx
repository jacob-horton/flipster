import FlashcardComponent from "@components/routeFiles/FlashcardComponent";
import PageSection, { SectionArticle } from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { Flashcard } from "@src/types/Flashcard";
import { getFlashcards } from "@src/getFlashcards";
import { useAuth } from "react-oidc-context";
import FolderListView from "@components/FolderListView";
import { useState } from "react";
import ReviewPopup from "@components/routeReview/ReviewPopup";
import { useQuery } from "@tanstack/react-query";
import getRootFolder from "@src/getRootFolder";
import Button from "@components/Button";
import { useRouter } from "next/router";
import { getRequest } from "@src/apiRequest";
import { ParsedUrlQuery } from "querystring";
import { NextFlashcardGetResp } from "@src/types/NextFlashcardGetResp";
import { Mode } from "@src/types/Mode";
import { useSessionStorage } from "@src/useStorage";

interface ReviewQueryParams extends ParsedUrlQuery {
    modes: Mode[];
    flashcardIds: string[];
}

function calcMaxWidth(fIds: number[]) {
    const fidLength = Math.max(...fIds).toString().length;
    return Math.max(6, fidLength * 2 + 2);
}

export default function ReviewIndex() {
    const auth = useAuth();
    // breaking setState convention to indicate storage?
    const [reviewModes, storeReviewModes] = useSessionStorage(
        "review-modes",
        ""
    );
    const [reviewFIDs, storeReviewFIDs] = useSessionStorage("review-fids", "");
    const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
    const [selectedFlashcards, setSelectedFlashcards] = useState<
        Map<number, boolean>
    >(new Map());
    const defaultSelection = true;
    const [showPopup, setShowPopup] = useState(false);

    // TODO: make this the FolderListView default?
    const { data: rootFolder } = useQuery({
        queryKey: ["rootFolder", auth.user],
        queryFn: async () =>
            (await getRootFolder(auth.user?.id_token)) ??
            Promise.reject("Unauthorised"),
        enabled: !!auth.user?.id_token,
    });

    const { data: accessedFlashcards } = useQuery({
        queryKey: ["accessedFlashcards", selectedFolders, auth.user?.id_token],
        queryFn: async () => {
            let flashcards: Flashcard[] = [];
            if (!auth.user?.id_token) return flashcards;
            for (const fId of selectedFolders) {
                flashcards = flashcards.concat(
                    await getFlashcards(auth.user.id_token, fId)
                );
            }
            return flashcards;
        },
        enabled: !!(auth.user?.id_token && selectedFolders),
        keepPreviousData: true,
    });

    /**
     * One version of this page uses the 'modes' query params. This
     * essentially stores the state of the review in the link, so the
     * pages can keep firing off new requests for the next flashcards.
     *
     * If query params exist, the user is reviewing flashcards (not selecting).
     * This page sends a get request with the modes and flashcard ids to
     * the API, which sends back the next mode and ids that the user review.
     * It would be good to document this and link here instead.
     */
    const { data, isLoading: gettingMode } = useQuery({
        queryKey: ["next", reviewModes, reviewFIDs, auth.user],
        queryFn: async () => {
            if (!auth.user?.id_token) {
                return Promise.reject("Unauthorised");
            }
            if (!reviewModes || !reviewFIDs) {
                return Promise.reject(
                    `Queried with modes ${reviewModes} and flashcardIds ${reviewFIDs}, one of which was undefined.`
                );
            }
            const resp = await getRequest({
                path: "/review/next",
                id_token: auth.user.id_token,
                queryParams: {
                    modes: reviewModes.split(","),
                    flashcardIds: reviewFIDs.split(","),
                } as ReviewQueryParams,
            });
            if (resp.status != 200) {
                return Promise.reject(resp.body);
            } else {
                return (await resp.json()) as NextFlashcardGetResp;
            }
        },
        enabled: !!(reviewModes && reviewFIDs && auth.user?.id_token),
    });

    const mode = data?.mode;
    const flashcardIds = data?.flashcardIds;
    const maxWidth = accessedFlashcards
        ? calcMaxWidth(Array.from(accessedFlashcards.keys()))
        : 0;

    if (!auth.user?.id_token || !rootFolder || !accessedFlashcards) {
        return <ProtectedRoute>{`${accessedFlashcards}`}</ProtectedRoute>;
    } else if (!reviewModes) {
        // modes not selected
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
                            (prevState) =>
                                new Map(prevState.set(f.id, !selected))
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
                <span>{reviewModes ? reviewModes : "none"}</span>
                <PageSection
                    className="min-h-0 w-full grow"
                    articles={[foldersArticle, flashcardsArticle]}
                />
                <span className="p-2" />
                <Button
                    onClick={() => {
                        accessedFlashcards.some(
                            (f) =>
                                selectedFlashcards.get(f.id) ?? defaultSelection
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
                    }}
                />
            </div>
        );
    } else if (gettingMode) {
        return <p>Loading review mode...</p>;
    } else if (mode && flashcardIds) {
        // received server response with selected mode
        return (
            <p>
                Selected {mode} mode with flashcard id(s) {flashcardIds}.
            </p>
        );
    } else {
        // TODO: better error message
        return <p>Failed to get from /next/flashcard</p>;
    }
}
