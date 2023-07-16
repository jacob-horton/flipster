import FlashcardComponent from "@components/routeReview/FlashcardComponent";
import PageSection, { SectionArticle } from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { Flashcard } from "@src/types/Flashcard";
import { getFlashcards } from "@src/getFlashcards";
import { useAuth } from "react-oidc-context";
import FolderListView from "@components/FolderListView";
import { useCallback, useState } from "react";
import ReviewPopup from "@components/routeReview/ReviewPopup";

const ReviewIndex = () => {
    const auth = useAuth();
    const [accessedFlashcards, setAccessedFlashcards] = useState<Flashcard[]>(
        []
    );

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

    /*const { data } = useQuery({
        queryFn: async () => {
            const token = auth.user?.id_token;
            if (!token) {
                return [];
            }
            const resp = await getRequest({
                path: "/user/top_level_folder",
                id_token: token,
            });
            const fid = await resp.text();
            const flashcards = await getFlashcards(token, parseInt(fid));

            return flashcards as Flashcard[];
        },
        queryKey: [auth],
        initialData: [],
    });*/

    const pageSection = (
        <PageSection
            className="min-h-0 w-full grow"
            articles={[
                <SectionArticle className="w-full" titleBar="Review">
                    <FolderListView
                        selectMultiple={true}
                        onSelectedFoldersChange={onSelectedFoldersChange}
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
                                indexWidth={calcMaxWidth()}
                            />
                        ))}
                    </div>
                </SectionArticle>,
            ]}
        />
    );
    return (
        <ProtectedRoute>
            <div className="flex h-full flex-col items-center space-y-4 p-4">
                {pageSection}
                <ReviewPopup />
            </div>
        </ProtectedRoute>
    );
};

export default ReviewIndex;
