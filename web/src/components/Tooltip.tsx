import { ReactNode, useState } from "react";

interface TooltipProps {
  children: ReactNode;
  tooltip: string;
  mode: "hover" | "click";
}

const Tooltip: React.FC<TooltipProps> = ({ children, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const opacity = showTooltip ? "opacity-100 mt-2" : "opacity-0 mt-4";

  // TODO: still interactable
  console.log("i");
  return (
    <div className="relative">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {/* Max width of 52 */}
      <div className="w-52 flex justify-center absolute z-50 right-1/2 translate-x-1/2">
        <div
          className={`${opacity} drop-shadow-lg text-xs rounded-lg bg-gray-100 border border-black border-opacity-20 p-2 text-center transition-all select-none duration-200 ease-out`}
        >
          {tooltip}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
