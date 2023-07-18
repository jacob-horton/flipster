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

export default function ReviewIndex() {
    const auth = useAuth();
    const [accessedFlashcards, setAccessedFlashcards] = useState<Flashcard[]>(
        []
    );
    const [showPopup, setShowPopup] = useState(false);

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
        queryKey: [auth.user],
        queryFn: async () => await getRootFolder(auth.user?.id_token),
    });

    if (!rootFolder) {
        return <ProtectedRoute>{}</ProtectedRoute>;
    }

    const pageSection = (
        <PageSection
            className="min-h-0 w-full grow"
            articles={[
                <SectionArticle className="w-full" titleBar="Review">
                    <FolderListView
                        rootFolder={rootFolder}
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
        <div className="flex h-full flex-col items-center p-4">
            {pageSection}
            <span className="p-2" />
            <Button onClick={() => setShowPopup(true)}>Review</Button>
            <ReviewPopup
                show={showPopup}
                onCancel={() => {
                    setShowPopup(false);
                }}
            />
        </div>
    );
}
