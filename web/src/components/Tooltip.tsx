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
                    showTooltip ? "opacity-100 visible" : "opacity-0 invisible"
                } w-52 flex justify-center absolute right-1/2 translate-x-1/2 show-transition`}
            >
                <div className="drop-shadow-lg text-xs rounded-lg bg-gray-100 light-border p-2 text-center select-none">
                    {tooltip}
                </div>
            </div>
        </div>
    );
};

export default Tooltip;
