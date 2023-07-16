import Button from "@components/Button";
import Popup from "@components/Popup";
import { useState, MouseEventHandler, ReactNode } from "react";

const modes = ["flip", "match", "learn"] as const;
type Mode = (typeof modes)[number];
type SelectedMode = Map<Mode, boolean>;

interface OptionButtonProps {
    active: boolean;
    onClick?: MouseEventHandler;
    children?: ReactNode;
}

const OptionButton: React.FC<OptionButtonProps> = ({
    active,
    onClick,
    children,
}) => {
    return (
        <button
            onClick={onClick}
            className={`${
                active
                    ? "m-4 border-[3px] border-purple-500"
                    : // 17.5 from 16px (m-4) + 1.5px (3px border -> 1.5px light-border)
                      "light-border m-[17.5px]"
            } rounded-lg bg-gray-300 px-5`}
        >
            <div className="flex h-[120px] w-[100px] items-center justify-center">
                {children}
            </div>
        </button>
    );
};

function ReviewPopup() {
    const [showPopup, setShowPopup] = useState(false);
    // currently selected button used as revision mode
    const [selectedMode, setSelectedMode] = useState<SelectedMode>(new Map());
    return (
        <>
            <Popup
                show={showPopup}
                onCancel={() => {
                    setShowPopup(false);
                }}
            >
                <div className="flex w-full grow flex-col">
                    <div className="flex justify-between">
                        {modes.map((i) => (
                            <OptionButton
                                active={selectedMode.get(i) ?? false}
                                onClick={() =>
                                    setSelectedMode(
                                        new Map(selectedMode.entries()).set(
                                            i,
                                            !selectedMode.get(i)
                                        )
                                    )
                                }
                            >{`${i}Icon`}</OptionButton>
                        ))}
                    </div>
                    <div className="flex grow items-end justify-center">
                        <Button
                            href="/review/cards"
                            query={{
                                mode: Array.from(selectedMode, ([k, v]) => {
                                    return v ? k : undefined;
                                }).filter((i): i is Mode => !!i),
                            }}
                        >
                            Review
                        </Button>
                    </div>
                </div>
            </Popup>
            <Button onClick={() => setShowPopup(true)}>Review</Button>
        </>
    );
}

export default ReviewPopup;
