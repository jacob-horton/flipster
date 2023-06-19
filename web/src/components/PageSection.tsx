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
        <div className={className}>
            <div
                className={
                    "overflow-auto h-full relative flex flex-col grow bg-white rounded-lg py-2 px-3 space-y-2 yourmum "
                }
            >
                <div className="flex flex-row items-center space-x-2">
                    {icon}
                    <div className="text-2xl text-gray-800 w-full">
                        {titleBar}
                    </div>
                </div>
                {bgIcon && (
                    <div className="opacity-100 rounded-lg absolute left-0 right-0 top-0 bottom-0 overflow-clip">
                        <div className="absolute right-[-25px] bottom-[-60px] text-gray-800 opacity-10 space-x-4 space-y-4 z-0">
                            {bgIcon}
                        </div>
                    </div>
                )}
                <div className="flex grow z-10">{children}</div>
            </div>
        </div>
    );
};

export default PageSection;
