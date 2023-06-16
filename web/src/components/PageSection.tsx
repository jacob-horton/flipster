import { ReactNode } from "react";

interface PageSectionProps {
  className?: string;
  children?: ReactNode;
}

const PageSection: React.FC<PageSectionProps> = ({ className, children }) => {
  return (
    <div className={`flex ${className ?? ""}`}>
      <div className="flex flex-grow bg-white rounded-lg border-[1.5px] border-opacity-10 border-black">
        {children}
      </div>
    </div>
  );
};

export default PageSection;
