import FlashcardComponent from "@components/routeFiles/FlashcardComponent";
import PageSection, { SectionArticle } from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { Flashcard } from "@src/types/Flashcard";
import { getFlashcards } from "@src/getFlashcards";
import { useAuth } from "react-oidc-context";
import { useQuery } from "@tanstack/react-query";
import { getRequest } from "@src/apiRequest";

const manualFlashcards = [
    {
        id: 0,
        term: "Lorem ipsum crimble crumble that's just how the cookie crumbles",
        definition:
            "world! I'm going to talk about my feelings for a few minutes. Lately everything has",
    },
    {
        id: 22,
        term: "When",
        definition:
            "They ask you how you are and you just have to say that you're fine. But you're NOT really fine, you just can't get into it because they would never understand.",
    },
];

const fillerFlashcards: Flashcard[] = [...new Array(10).keys()].map((i) => ({
    id: i + 1,
    term: "Hello",
    definition: "world!",
}));

const flashcards = [...manualFlashcards, ...fillerFlashcards];

const Review = () => {
    const auth = useAuth();
    // expand the index section when numbers exceed double digits (rel. to font size)
    const fidLength = Math.max(...flashcards.map((f) => f.id)).toString()
        .length;
    const width = Math.max(6, fidLength * 2 + 2);

    const { data } = useQuery({
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
    });

    const pageSection = (
        <PageSection
            className="grow w-full h-full"
            articles={[
                <SectionArticle className="w-full" titleBar="Review">
                    Hello
                </SectionArticle>,
                <SectionArticle
                    titleBar="Flashcards"
                    className="w-full overflow-auto mb-4"
                >
                    <div className="grow space-y-2">
                        {data.map((f, i) => (
                            <FlashcardComponent
                                key={f.id}
                                flashcard={{
                                    ...f,
                                    id: i + 1,
                                }}
                                mode="select"
                                indexWidth={width}
                            />
                        ))}
                    </div>
                </SectionArticle>,
            ]}
        />
    );
    return (
        <ProtectedRoute>
            <div className="h-full flex flex-col items-center p-4">
                {pageSection}
            </div>
        </ProtectedRoute>
    );
};

export default Review;
