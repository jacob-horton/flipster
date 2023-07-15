import FlashcardComponent from "@components/routeFiles/FlashcardComponent";
import PageSection, { SectionArticle } from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { Flashcard } from "@src/types/Flashcard";
import { getFlashcards } from "@src/getFlashcards";
import { useAuth } from "react-oidc-context";
import { useQuery } from "@tanstack/react-query";
import { getRequest } from "@src/apiRequest";
import FolderListView from "@components/FolderListView";
import { useCallback, useEffect, useState } from "react";

const Review = () => {
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

    const { data: topLevelFolder } = useQuery({
        queryKey: [auth.user],
        queryFn: async () => {
            // TODO: properly handle no token
            const token = auth.user?.id_token;
            if (token === undefined || auth.user?.expired) {
                return;
            }

            const resp = await getRequest({
                path: "/user/top_level_folder",
                id_token: token,
            });

            const id = parseInt(await resp.text());
            return { children: [], name: "Your Files", id };
        },
    });

    const pageSection = (
        <PageSection
            className="h-full w-full grow"
            articles={[
                <SectionArticle className="w-full" titleBar="Review">
                    <FolderListView
                        selectMultiple={true}
                        onSelectedFoldersChange={onSelectedFoldersChange}
                        topLevelFolder={topLevelFolder}
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
            <div className="flex h-full flex-col items-center p-4">
                {pageSection}
            </div>
        </ProtectedRoute>
    );
};

export default Review;
