import { ReactElement, ReactNode } from "react";

interface BackgroundIconProps {
    icon: ReactNode;
}

const BackgroundIcon: React.FC<BackgroundIconProps> = ({ icon }) => {
    return (
        <div className="opacity-100 rounded-lg absolute inset-0 overflow-clip">
            <div className="absolute right-[-25px] bottom-[-60px] text-gray-800 opacity-10 z-0">
                {icon}
            </div>
        </div>
    );
};

interface SectionArticleProps {
    className?: string;
    children?: ReactNode;
    titleBar: ReactNode;
    icon?: ReactNode;
    bgIcon?: ReactNode;
}

export const SectionArticle: React.FC<SectionArticleProps> = ({
    icon,
    titleBar,
    bgIcon,
    children,
    className,
}) => {
    return (
        <div className={" w-full " + className ?? ""}>
            <div className="overflow-auto flex py-2 px-3 flex-col space-y-2 h-full relative">
                <div className="inline-flex align-top items-center space-x-2">
                    {icon}
                    <h1 className="text-xl text-gray-800 w-full">{titleBar}</h1>
                </div>
                {bgIcon && <BackgroundIcon icon={bgIcon} />}
                <div className="z-10 grow">{children}</div>
            </div>
        </div>
    );
};

interface PageSectionProps {
    className?: string;
    articles?: ReactElement<SectionArticleProps>[];
    // these attributes support treating a PageSection as a SectionArticle
    children?: ReactNode;
    titleBar?: ReactNode;
    icon?: ReactNode;
    bgIcon?: ReactNode;
}

const PageSection: React.FC<PageSectionProps> = ({
    className,
    articles,
    children,
    titleBar,
    icon,
    bgIcon,
}) => {
    /**
     * Displayed as a white box with a gray border. Usually has 1-2 SectionArticle children, but supports
     * any multitude. Can be created in exact same way as SectionArticle - in this case it will be treated
     * as one single SectionArticle inside a PageSection.
     */
    if (!articles) {
        articles = [
            <SectionArticle
                children={children}
                titleBar={titleBar}
                icon={icon}
                bgIcon={bgIcon}
            />,
        ];
    }
    return (
        <div className={" grow " + className ?? ""}>
            <div className="bg-white rounded-lg flex flex-row h-full light-border ">
                {articles.map((SectionArticle, i) => (
                    <>
                        {i > 0 ? (
                            <div className="border border-gray-300 self-center h-[95%]"></div>
                        ) : undefined}
                        {SectionArticle}
                    </>
                ))}
            </div>
        </div>
    );
};

export default PageSection;
