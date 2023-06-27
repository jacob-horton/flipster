import PageSection from "../PageSection";
import Button from "../Button";

import { AiOutlineInfoCircle } from "react-icons/ai";
import { FiRepeat } from "react-icons/fi";
import { BiCopy } from "react-icons/bi";
import { HiOutlineDocumentMagnifyingGlass } from "react-icons/hi2";
import Tooltip from "@components/Tooltip";

const SpacedRepetition = () => {
    const tiers = [
        {
            colour: "bg-red-400",
            numberFlashcards: 25,
        },
        {
            colour: "bg-orange-300",
            numberFlashcards: 15,
        },
        {
            colour: "bg-yellow-300",
            numberFlashcards: 5,
        },
        {
            colour: "bg-lime-300",
            numberFlashcards: 20,
        },
        {
            colour: "bg-green-300",
            numberFlashcards: 30,
        },
    ];

    return (
        <PageSection
            className="col-span-2"
            titleBar=<div className="flex flex-row items-center justify-between">
                <p>Spaced Repetition</p>
                <Tooltip
                    tooltip="Focus on learning the flashcards you struggle with"
                    mode="hover"
                >
                    <AiOutlineInfoCircle />
                </Tooltip>
            </div>
            icon={<FiRepeat size={18} />}
            bgIcon={<FiRepeat size={200} />}
        >
            <div className="flex flex-col grow justify-between h-full items-center">
                <div className="w-full space-y-1">
                    {tiers.map((tier, i) => {
                        const priority = ((i + 1) * 751391) % 25;
                        return (
                            <div
                                key={`tier-${i + 1}`}
                                className="flex flex-row grow justify-between items-center"
                            >
                                <div className="flex flex-row items-center space-x-2">
                                    <div
                                        className={`aspect-square h-4 w-4 rounded-lg ${tier.colour}`}
                                    />
                                    <p>Tier {i + 1}</p>
                                </div>
                                <div className="flex flex-row space-x-2">
                                    <div className="flex flex-row items-center space-x-1">
                                        <BiCopy />
                                        <p className="aspect-square w-6">
                                            {priority}
                                        </p>
                                    </div>
                                    <button>
                                        <HiOutlineDocumentMagnifyingGlass
                                            size={20}
                                        />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Button>Review All</Button>
            </div>
        </PageSection>
    );
};

export default SpacedRepetition;
