import Button from "@components/Button";
import Popup from "@components/Popup";
import { useState } from "react";

interface ReviewPopupProps {
    className?: string;
}

const ReviewPopup: React.FC<ReviewPopupProps> = ({ className }) => {
    const [showPopup, setShowPopup] = useState(false);
    return (
        <>
            <Popup
                show={showPopup}
                onCancel={() => {
                    setShowPopup(false);
                }}
            >
                <div className="w-full flex flex-col grow">
                    <div className="flex justify-between">
                        <Button>Hi</Button>
                        <Button>Hi</Button>
                        <Button>Hi</Button>
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
