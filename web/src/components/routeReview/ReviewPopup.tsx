import Button from "@components/Button";
import Popup from "@components/Popup";
import { useState, MouseEventHandler, ReactNode } from "react";

// allows usage as string literal, see const assertion ts
const modes = ["Flip", "Match", "Learn"] as const;

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
                    ? "border-purple-500 border-[3px] m-4"
                    : // 17.5 from 16px (m-4) + 1.5px (3px border -> 1.5px light-border)
                      "light-border m-[17.5px]"
            } bg-gray-300 px-5 rounded-lg`}
        >
            <div className="w-[100px] h-[120px] flex justify-center items-center">
                {children}
            </div>
        </button>
    );
};

interface ReviewPopupProps {
    className?: string;
}

const ReviewPopup: React.FC<ReviewPopupProps> = ({ className }) => {
    const [showPopup, setShowPopup] = useState(false);
    // currently selected button used as revision mode
    const [selectedMode, setSelectedMode] = useState<
        (typeof modes)[number] | null
    >(null);
    return (
        <>
            <Popup
                show={showPopup}
                onCancel={() => {
                    setShowPopup(false);
                }}
            >
                <div className="w-full flex flex-col grow space-y-4">
                    <div className="flex justify-between">
                        {modes.map((i) => (
                            <OptionButton
                                active={i === selectedMode}
                                onClick={() => setSelectedMode(i)}
                            >{`${i}Icon`}</OptionButton>
                        ))}
                    </div>
                    <div className="flex justify-center items-end grow">
                        <Button>Review</Button>
                    </div>
                </div>
            </Popup>
            <Button className={className} onClick={() => setShowPopup(true)}>
                Review
            </Button>
        </>
    );
};

export default ReviewPopup;
