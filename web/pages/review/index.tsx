import FlashcardComponent from "@components/routeFiles/FlashcardComponent";
import PageSection, { SectionArticle } from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { Flashcard } from "@src/types/Flashcard";
import { getFlashcards } from "@src/getFlashcards";
import { useAuth } from "react-oidc-context";
import FolderListView from "@components/FolderListView";
import { useCallback, useState } from "react";
import ReviewPopup from "@components/routeReview/ReviewPopup";
import { useQuery } from "@tanstack/react-query";
import getRootFolder from "@src/getRootFolder";
import Button from "@components/Button";
import { useRouter } from "next/router";
import { getRequest } from "@src/apiRequest";
import { ParsedUrlQuery } from "querystring";
import { NextFlashcardGetResp } from "@src/types/NextFlashcardGetResp";
import { Mode } from "@src/types/Mode";

type SelectedFlashcards = Map<number, boolean>;

interface ReviewQueryParams extends ParsedUrlQuery {
    modes: Mode[];
    flashcardIds: string[];
}

export default function ReviewIndex() {
    const auth = useAuth();
    // distinct from 'selected'
    const [accessedFlashcards, setAccessedFlashcards] = useState<Flashcard[]>(
        []
    );
    const [selectedFlashcards, setSelectedFlashcards] =
        useState<SelectedFlashcards>(new Map());
    const [showPopup, setShowPopup] = useState(false);
    const router = useRouter();
    const query = router.query as ReviewQueryParams;

    // expand the index section when numbers exceed double digits (rel. to font size)
    // TODO fix that this is called for every flashcard without using another state
    function calcMaxWidth() {
        const fidLength = Math.max(
            ...accessedFlashcards.map((f) => f.id)
        ).toString().length;
        return Math.max(6, fidLength * 2 + 2);
    }

    const onSelectedFoldersChange = useCallback(
        async (folderIds: number[]) => {
            let flashcards: Flashcard[] = [];
            if (!auth.user?.id_token) return flashcards;
            for (const fId of folderIds) {
                flashcards = flashcards.concat(
                    await getFlashcards(auth.user.id_token, fId)
                );
            }
            setAccessedFlashcards(flashcards);
        },
        [auth]
    );

    // TODO: make this the FolderListView default?
    const { data: rootFolder } = useQuery({
        queryKey: ["user", auth.user],
        queryFn: async () =>
            (await getRootFolder(auth.user?.id_token)) ??
            Promise.reject("Unauthorised"),
        enabled: !!auth.user,
    });

    /**
     * One version of this page uses the 'modes' query params. This
     * essentially stores the state of the review in the link, so the
     * page can keep firing off new requests for the next flashcards.
     *
     * If query params exist, the user is reviewing flashcards (not selecting).
     * This page sends a get request with the modes (TODO: and sel fids) to
     * the API, which sends back the next mode (TODO: and fids) that
     * the user will review the flashcard in.
     * It would be good to document this and link here instead.
     */
    const { data, isLoading: gettingMode } = useQuery({
        queryKey: ["next", query.modes, query.flashcardIds, auth.user],
        queryFn: async () => {
            if (!auth.user?.id_token) {
                return Promise.reject("Unauthorised");
            }
            if (!query.modes || !query.flashcardIds) {
                return Promise.reject(
                    `Queried with modes ${query.modes} and flashcardIds ${query.flashcardIds}, one of which was undefined.`
                );
            }
            const resp = await getRequest({
                path: "/review/next",
                id_token: auth.user.id_token,
                queryParams: query,
            });
            if (resp.status != 200) {
                return Promise.reject(resp.body);
            } else {
                return (await resp.json()) as NextFlashcardGetResp;
            }
        },
        enabled: !!(query.modes && query.flashcardIds && auth.user?.id_token),
    });
    const mode = data?.mode;
    const flashcardIds = data?.flashcardIds;
    if (!auth.user?.id_token || !rootFolder) {
        return (
            <ProtectedRoute>
                {/* Should only appear if getting rootFolder? */}
                Loading your files...
            </ProtectedRoute>
        );
    } else if (!query.modes) {
        // modes not selected
        // TODO: move into own component
        return (
            <div className="flex h-full flex-col items-center p-4">
                <PageSection
                    className="min-h-0 w-full grow"
                    articles={[
                        <SectionArticle className="w-full" titleBar="Review">
                            <FolderListView
                                rootFolder={rootFolder}
                                selectMultiple={true}
                                onSelectedFoldersChange={
                                    onSelectedFoldersChange
                                }
                            />
                        </SectionArticle>,
                        <SectionArticle
                            titleBar="Flashcards"
                            className="mb-4 w-full overflow-auto"
                        >
                            <div className="grow space-y-2">
                                {accessedFlashcards.map((f, i) => (
                                    <FlashcardComponent
                                        key={f.id}
                                        flashcard={{
                                            ...f,
                                            id: i + 1,
                                        }}
                                        mode="select"
                                        onSelect={(selected) =>
                                            setSelectedFlashcards(
                                                new Map(
                                                    selectedFlashcards.entries()
                                                ).set(i, selected)
                                            )
                                        }
                                        indexWidth={calcMaxWidth()}
                                    />
                                ))}
                            </div>
                        </SectionArticle>,
                    ]}
                />
                <span className="p-2" />
                <Button
                    onClick={() => {
                        Array.from(selectedFlashcards.values()).some((x) => x)
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
                        // makes the button work as a link with query params
                        router.push({
                            pathname: "/review",
                            query: {
                                modes,
                                flashcardIds: Array.from(
                                    selectedFlashcards,
                                    ([k, v]) => {
                                        return v ? String(k) : undefined;
                                    }
                                ).filter((i): i is string => !!i),
                            } as ReviewQueryParams,
                        });
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
