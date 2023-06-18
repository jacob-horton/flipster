import { ReactNode } from "react";

interface PageSectionProps {
    className?: string;
    children?: ReactNode;
    titleBar: ReactNode;
    icon?: ReactNode;
    bgIcon?: ReactNode;
}

const PageSection: React.FC<PageSectionProps> = ({
    className,
    children,
    titleBar,
    icon,
    bgIcon,
}) => {
    return (
        <div className={`flex relative ${className ?? ""}`}>
            <div className="flex flex-col flex-grow bg-white rounded-lg border-[1.5px] border-opacity-10 border-black py-2 px-3 space-y-2">
                <div className="z-20 flex flex-row items-center space-x-2">
                    {icon}
                    <h1 className="text-xl text-gray-800 w-full">{titleBar}</h1>
                </div>
                <div className="z-10 flex flex-grow">{children}</div>
            </div>
            <div className="opacity-100 rounded-lg absolute left-0 right-0 top-0 bottom-0 overflow-clip">
                <div className="absolute right-[-25px] bottom-[-60px] text-gray-800 opacity-10 space-x-4 space-y-4 z-0">
                    {bgIcon}
                </div>
            </div>
        </div>
    );
};

export default PageSection;
