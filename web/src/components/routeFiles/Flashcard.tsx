import { FlashcardType } from "@src/types/Flashcard";
import { useState } from "react";

import { BsCheck } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
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
                className +
                " bg-gray-50 px-2 py-1 light-border " +
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
                "ml-1 self-center rounded-full light-border " +
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

const EditButton = () => {
    return (
        <button className="ml-1 self-center p-1 rounded-lg border-purple-500 border">
            <IconContext.Provider value={{ color: "#a855f7" }}>
                <CiEdit />
            </IconContext.Provider>
        </button>
    );
};

type FlashcardProps = {
    flashcard: FlashcardType;
    mode: "edit" | "select";
};

const FlashcardUI: React.FC<FlashcardProps> = ({ flashcard, mode }) => {
    return (
        <div className="flex flex-row w-full text-sm space-x-1">
            <RoundedSection side="left">
                <div className="w-3">{flashcard.flashcardId}</div>
            </RoundedSection>
            <RoundedSection className="w-full align-top">
                <strong>{flashcard.term}</strong>
            </RoundedSection>
            <RoundedSection side="right" className="w-full align-text-top">
                {flashcard.definition}
            </RoundedSection>
            {mode === "select" ? <SelectedButton /> : <EditButton />}
        </div>
    );
};

export default FlashcardUI;
