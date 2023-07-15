import { ReactNode, useState } from "react";

interface TooltipProps {
    children: ReactNode;
    tooltip: string;
    mode: "hover" | "click";
}

const Tooltip: React.FC<TooltipProps> = ({ children, tooltip }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative z-10">
            <div
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {children}
            </div>
            {/* Max width of 52 */}
            <div
                className={`${
                    showTooltip ? "visible opacity-100" : "invisible opacity-0"
                } show-transition absolute right-1/2 flex w-52 translate-x-1/2 justify-center`}
            >
                <div className="light-border select-none rounded-lg bg-gray-100 p-2 text-center text-xs drop-shadow-lg">
                    {tooltip}
                </div>
            </div>
        </div>
    );
};

export default Tooltip;
