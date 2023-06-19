import { ReactNode } from "react";

export const BORDER = " border-[1.5px] border-opacity-10 border-black ";

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
        <div className={className ?? ""}>
            <div
                className={
                    "overflow-clip h-full relative flex flex-col grow bg-white rounded-lg py-2 px-3 space-y-2 " +
                    BORDER
                }
            >
                <div className="flex flex-row items-center space-x-2">
                    {icon}
                    <h1 className="text-2xl text-gray-800 w-full">
                        {titleBar}
                    </h1>
                </div>
                {bgIcon && (
                    <div className="absolute right-[-25px] bottom-[-60px] text-gray-800 opacity-10 space-x-4 space-y-4 z-0">
                        {bgIcon}
                    </div>
                )}
                <div className="overflow-scroll flex grow z-10">{children}</div>
            </div>
        </div>
    );
};

export default PageSection;
