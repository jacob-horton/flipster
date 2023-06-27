import FlashcardUI from "@components/routeFiles/FlashcardComponent";
import PageSection, { SectionArticle } from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { FlashcardData } from "@src/types/FlashcardData";

const manualFlashcards = [
    {
        flashcardId: 0,
        term: "Lorem ipsum crimble crumble that's just how the cookie crumbles",
        definition:
            "world! I'm going to talk about my feelings for a few minutes. Lately everything has",
    },
    {
        flashcardId: 22,
        term: "When",
        definition:
            "They ask you how you are and you just have to say that you're fine. But you're NOT really fine, you just can't get into it because they would never understand.",
    },
];

const fillerFlashcards: FlashcardData[] = [...new Array(10).keys()].map(
    (i) => ({
        flashcardId: i + 1,
        term: "Hello",
        definition: "world!",
    })
);

const flashcards = [...manualFlashcards, ...fillerFlashcards];

const Review = () => {
    // expand the index section when numbers exceed double digits (rel. to font size)
    const fidLength = Math.max(
        ...flashcards.map((f) => f.flashcardId)
    ).toString().length;
    const maxIdSize = Math.max(6, fidLength * 2 + 2);

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
                        {flashcards.map((f) => (
                            <FlashcardUI
                                key={f.flashcardId}
                                flashcard={f}
                                mode="select"
                                indexSize={maxIdSize}
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
