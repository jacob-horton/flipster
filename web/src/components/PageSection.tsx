import React from "react";
import { ReactElement, ReactNode } from "react";

interface BackgroundIconProps {
    icon: ReactNode;
}

const BackgroundIcon: React.FC<BackgroundIconProps> = ({ icon }) => {
    return (
        <div className="opacity-100 rounded-lg absolute inset-0 overflow-clip">
            <div className="absolute right-[-25px] bottom-[-60px] text-gray-800 opacity-10">
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
    className,
    icon,
    titleBar,
    bgIcon,
    children,
}) => {
    return (
        <div className={className ?? ""}>
            <div className="h-full flex flex-col relative py-2 px-3">
                {bgIcon && <BackgroundIcon icon={bgIcon} />}
                <div className="flex items-center space-x-2 pb-2">
                    {icon}
                    <h1 className="w-full text-xl text-gray-800">{titleBar}</h1>
                </div>
                <div className="grow relative">{children}</div>
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
                className="w-full"
                children={children}
                titleBar={titleBar}
                icon={icon}
                bgIcon={bgIcon}
            />,
        ];
    }
    return (
        <div className={className ?? ""}>
            <div className=" h-full flex flex-row bg-white light-border rounded-lg ">
                {articles.map((SectionArticle, i) => (
                    <React.Fragment key={i}>
                        {i > 0 ? (
                            <div className="border border-gray-300 self-center h-[95%]"></div>
                        ) : undefined}
                        {SectionArticle}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default PageSection;
