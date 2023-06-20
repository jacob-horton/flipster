import React, { ReactNode, useEffect } from "react";

interface PopupProps {
    children?: ReactNode;
    show: boolean;
    onCancel?: () => void;
}

const Popup: React.FC<PopupProps> = ({ children, show, onCancel }) => {
    useEffect(() => {
        const handleEsc = (event: { keyCode: number }) => {
            // If escape pressed
            if (event.keyCode === 27 && onCancel) {
                onCancel();
            }
        };

        window.addEventListener("keydown", handleEsc);

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onCancel]);

    return show ? (
        <div onClick={onCancel}>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div
                    className="px-4 py-3 min-w-[35%] min-h-[25%] bg-gray-100 border border-black border-opacity-20 drop-shadow-2xl shadow-gray-200 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </div>
    ) : null;
};

export default Popup;
