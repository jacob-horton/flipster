import { Flashcard } from "@src/types/Flashcard";
import { MouseEventHandler } from "react";

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
                    " light-border flex h-full flex-row bg-gray-50 " +
                    (side === "left" ? " rounded-l-lg " : "") +
                    (side === "right" ? " rounded-r-lg " : "")
                }
            >
                {children}
            </div>
        </div>
    );
};

interface SelectedButtonProps {
    selected: boolean;
    onClick: MouseEventHandler;
}

function SelectedButton({ selected, onClick }: SelectedButtonProps) {
    return (
        <button
            className={
                "light-border ml-1 self-center rounded-full " +
                (selected ? "bg-orange-500" : "bg-gray-100")
            }
            onClick={onClick}
        >
            <IconContext.Provider
                value={{ color: selected ? "white" : "gray" }}
            >
                <BsCheck />
            </IconContext.Provider>
        </button>
    );
}

const EditButton = () => {
    return (
        <button className="ml-1 self-center rounded-lg border border-purple-500 p-1">
            <IconContext.Provider value={{ color: "#a855f7" }}>
                <CiEdit />
            </IconContext.Provider>
        </button>
    );
};

interface BaseFlashcardProps {
    flashcard: Flashcard;
    indexWidth: number;
}

interface EditFlashcardProps extends BaseFlashcardProps {
    mode: "edit";
}

interface SelectFlashcardProps extends BaseFlashcardProps, SelectedButtonProps {
    mode: "select";
}

type FlashcardProps = EditFlashcardProps | SelectFlashcardProps;

const FlashcardComponent: React.FC<FlashcardProps> = (props) => {
    const flashcard = props.flashcard;
    const indexWidth = props.indexWidth;
    const fid = flashcard.id;
    return (
        <div className="flex w-full flex-row space-x-1 text-sm">
            <RoundedSection side="left">
                <div className={`w-${indexWidth} self-center text-center`}>
                    {fid}
                </div>
            </RoundedSection>
            <RoundedSection className="w-full align-top">
                <strong className="self-center px-2 py-1">
                    {flashcard.term}
                </strong>
            </RoundedSection>
            <RoundedSection side="right" className="w-full align-text-top">
                <span className="self-center px-2 py-1">
                    {flashcard.definition}
                </span>
            </RoundedSection>
            {props.mode === "select" ? (
                <SelectedButton
                    selected={props.selected}
                    onClick={props.onClick}
                />
            ) : (
                <EditButton />
            )}
        </div>
    );
};

export default FlashcardComponent;
