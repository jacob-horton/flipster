import { Flashcard } from "@src/types/Flashcard";
import { useState } from "react";

import { BsCheck } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import { IconContext } from "react-icons";

interface RoundedSectionProps {
    side?: "left" | "right";
    children?: React.ReactNode;
    className?: string;
    centerText?: boolean;
}

const RoundedSection: React.FC<RoundedSectionProps> = ({
    side,
    children,
    className,
}) => {
    return (
        <div className={className ?? ""}>
            <div
                className={
                    " h-full flex flex-row bg-gray-50 light-border " +
                    (side === "left" ? " rounded-l-lg " : "") +
                    (side === "right" ? " rounded-r-lg " : "")
                }
            >
                {children}
            </div>
        </div>
    );
};

const SelectedButton = () => {
    const [selected, setSelected] = useState(false);
    return (
        <button
            className={
                "ml-1 self-center rounded-full light-border " +
                (selected ? "bg-orange-500" : "bg-gray-100")
            }
            onClick={() => {
                setSelected(!selected);
            }}
        >
            <IconContext.Provider
                value={{ color: selected ? "white" : "gray" }}
            >
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
    flashcard: Flashcard;
    indexWidth: number;
    mode: "edit" | "select";
};

const FlashcardUI: React.FC<FlashcardProps> = ({
    flashcard,
    mode,
    indexWidth,
}) => {
    const fid = flashcard.id;
    return (
        <div className="flex flex-row w-full text-sm space-x-1">
            <RoundedSection side="left">
                <div className={`w-${indexWidth} text-center self-center`}>
                    {fid}
                </div>
            </RoundedSection>
            <RoundedSection className="w-full align-top">
                <strong className="px-2 py-1 self-center">
                    {flashcard.term}
                </strong>
            </RoundedSection>
            <RoundedSection side="right" className="w-full align-text-top">
                <span className="px-2 py-1 self-center">
                    {flashcard.definition}
                </span>
            </RoundedSection>
            {mode === "select" ? <SelectedButton /> : <EditButton />}
        </div>
    );
};

export default FlashcardUI;
