import { FlashcardType } from "@src/types/Flashcard";
import { BORDER } from "@components/PageSection";

interface RoundedSectionProps {
    side?: "left" | "right";
    children?: React.ReactNode;
    className?: string;
}

const RoundedSection: React.FC<RoundedSectionProps> = ({
    side,
    children,
    className,
}) => {
    return (
        <div
            className={
                (className ?? "") +
                " bg-gray-50 p-4 my-1 mx-1" +
                BORDER +
                (side === "left" ? "rounded-l-lg" : "") +
                (side === "right" ? "rounded-r-lg" : "")
            }
        >
            {children}
        </div>
    );
};

type FlashcardProps = {
    flashcard: FlashcardType;
};

const FlashcardUI: React.FC<FlashcardProps> = ({ flashcard }) => {
    return (
        <div className="flex flex-row w-full">
            <RoundedSection side="left">
                <div className="w-3">{flashcard.flashcardId}</div>
            </RoundedSection>
            <RoundedSection className="grow">{flashcard.term}</RoundedSection>
            <RoundedSection side="right" className="grow">
                {flashcard.definition}
            </RoundedSection>
        </div>
    );
};

export default FlashcardUI;
