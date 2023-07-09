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
        <div
            onClick={onCancel}
            className="h-[100vh] w-[100vw] fixed inset-0 z-40 bg-[rgb(0,0,0,0.25)]"
        >
            {/* NOTE: use HTML dialog with 'open' attribute for accessibility.
             * It always evaluates to true here, as otherwise we don't render it */}
            <dialog
                open
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col min-h-[25%] min-w-[35%] px-4 py-3 justify-center items-center fixed inset-0 z-50 outline-none focus:outline-none bg-gray-100 light-border drop-shadow-2xl shadow-gray-200 rounded-lg"
            >
                {children}
            </dialog>
        </div>
    ) : null;
};

export default Popup;
