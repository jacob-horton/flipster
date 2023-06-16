import { ReactNode } from "react";
import { MdGroups } from "react-icons/md";

interface PageSectionProps {
  className?: string;
  children?: ReactNode;
  title: string;
  icon?: ReactNode;
  bgIcon?: ReactNode;
}

const PageSection: React.FC<PageSectionProps> = ({
  className,
  children,
  title,
  icon,
  bgIcon,
}) => {
  return (
    <div className={`flex ${className ?? ""}`}>
      <div className="overflow-clip relative flex flex-col flex-grow bg-white rounded-lg border-[1.5px] border-opacity-10 border-black py-2 px-3 space-y-2">
        <div className="flex flex-row items-center space-x-2">
          {icon}
          <header className="text-2xl text-gray-800">{title}</header>
        </div>
        <div className="absolute right-[-25px] bottom-[-60px] text-gray-800 opacity-10 space-x-4 space-y-4 z-0">
          {bgIcon}
        </div>
        <div className="flex flex-grow z-10">{children}</div>
      </div>
    </div>
  );
};

export default PageSection;
