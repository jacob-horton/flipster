import FlashcardUI from "@components/routeFiles/FlashcardUI";
import PageSection, { SectionArticle } from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { FlashcardType } from "@src/types/Flashcard";

const flashcards: FlashcardType[] = [
    {
        flashcardId: 0,
        term: "Lorem ipsum crimble crumble that's just how the cookie crumbles ",
        definition:
            "world! I'm going to talk about my feelings for a few minutes. Lately everything has",
    },
    {
        flashcardId: 1,
        term: "Hello, ",
        definition: "world!",
    },
    {
        flashcardId: 2,
        term: "Hello, ",
        definition: "world!",
    },
    {
        flashcardId: 3,
        term: "Hello, ",
        definition: "world!",
    },
    {
        flashcardId: 4,
        term: "Hello, ",
        definition: "world!",
    },
    {
        flashcardId: 5,
        term: "Hello, ",
        definition: "world!",
    },
    {
        flashcardId: 6,
        term: "Hello, ",
        definition: "world!",
    },
    {
        flashcardId: 7,
        term: "Hello, ",
        definition: "world!",
    },
    {
        flashcardId: 8,
        term: "Hello, ",
        definition: "world!",
    },
    {
        flashcardId: 9,
        term: "Hello, ",
        definition: "world!",
    },
    {
        flashcardId: 10,
        term: "Hello, ",
        definition: "world!",
    },
    {
        flashcardId: 11,
        term: "Hello, ",
        definition: "world!",
    },
];

const Review = () => {
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
