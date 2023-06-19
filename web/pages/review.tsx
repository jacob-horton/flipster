import FlashcardUI from "@components/routeFiles/Flashcard";
import PageSection from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { FlashcardType } from "@src/types/Flashcard";

const flashcards: FlashcardType[] = [
    {
        flashcardId: 0,
        term: "Hello, ",
        definition: "world!",
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
];

const Review = () => {
    return (
        <ProtectedRoute>
            <div className="h-full flex p-4 space-x-4">
                <PageSection titleBar={<h1>Review</h1>} className="w-full">
                    Hello
                </PageSection>
                <PageSection titleBar={<h1>Flashcards</h1>} className="w-full">
                    <div className="flex-grow">
                        {flashcards.map((f) => (
                            <FlashcardUI key={f.flashcardId} flashcard={f} />
                        ))}
                    </div>
                </PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Review;
