import { FlashcardType } from "@src/types/Flashcard";
import { BORDER } from "@components/PageSection";
import { useState } from "react";
import { BsCheck } from "react-icons/bs";
import { IconContext } from "react-icons";

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
                " bg-gray-50 p-3 my-1 mx-1" +
                BORDER +
                (side === "left" ? "rounded-l-lg" : "") +
                (side === "right" ? "rounded-r-lg" : "")
            }
        >
            {children}
        </div>
    );
};

const SelectedButton = () => {
    const [selected, setSelected] = useState(false);
    return (
        <button
            className={
                " self-center rounded-full " +
                BORDER +
                (selected ? "bg-orange-400" : "bg-orange-200")
            }
            onClick={() => {
                setSelected(!selected);
            }}
        >
            <IconContext.Provider value={{ color: "white" }}>
                <BsCheck />
            </IconContext.Provider>
        </button>
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
            <RoundedSection className="grow align-top">
                <strong>{flashcard.term}</strong>
            </RoundedSection>
            <RoundedSection side="right" className="grow align-text-top">
                {flashcard.definition}
            </RoundedSection>
            <SelectedButton />
        </div>
    );
};

export default FlashcardUI;
