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
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
                <div
                    className="light-border min-h-[25%] min-w-[35%] rounded-lg bg-gray-100 px-4 py-3 shadow-gray-200 drop-shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
            <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
        </div>
    ) : null;
};

export default Popup;
