import FlashcardUI from "@components/routeFiles/Flashcard";
import PageSection, { SectionArticle } from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { FlashcardType } from "@src/types/Flashcard";

const flashcard = {
    flashcardId: 0,
    term: "Lorem ipsum crimble crumble that's just how the cookie crumbles",
    definition:
        "world! I'm going to talk about my feelings for a few minutes. Lately everything has",
};

const fillerFlashcards: FlashcardType[] = [...new Array(10).keys()].map(
    (i) => ({
        flashcardId: i + 1,
        term: "Hello",
        definition: "world!",
    })
);

const flashcards = [flashcard, ...fillerFlashcards];

const Review = () => {
    return (
        <ProtectedRoute>
            <div className="h-full flex p-4 space-x-4">
                <PageSection
                    className="grow"
                    articles={[
                        <SectionArticle titleBar="Review">
                            Hello
                        </SectionArticle>,
                        <SectionArticle
                            titleBar="Flashcards"
                            className="overflow-y-scroll mb-4"
                        >
                            <div className="flex-grow space-y-2">
                                {flashcards.map((f) => (
                                    <FlashcardUI
                                        key={f.flashcardId}
                                        flashcard={f}
                                        mode="select"
                                    />
                                ))}
                            </div>
                        </SectionArticle>,
                    ]}
                />
            </div>
        </ProtectedRoute>
    );
};

export default Review;
