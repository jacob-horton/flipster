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
            <div className="flex flex-row p-4 space-x-4">
                <PageSection
                    titleBar={<h1>Review</h1>}
                    className="w-full"
                ></PageSection>
                <PageSection
                    titleBar={<h1>Flashcards</h1>}
                    className="w-full h-full max-h-full"
                >
                    <div className="w-full flex flex-col">
                        {flashcards.map((f) => (
                            <FlashcardUI flashcard={f} />
                        ))}
                    </div>
                </PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Review;
