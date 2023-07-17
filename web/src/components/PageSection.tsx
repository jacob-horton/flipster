import React from "react";
import { ReactElement, ReactNode } from "react";

interface BackgroundIconProps {
    icon: ReactNode;
}

const BackgroundIcon: React.FC<BackgroundIconProps> = ({ icon }) => {
    return (
        <div className="absolute inset-0 overflow-clip rounded-lg opacity-100">
            <div className="absolute bottom-[-60px] right-[-25px] opacity-10">
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
        <div className={className}>
            <div className="relative flex h-full flex-col px-3 py-2">
                {bgIcon && <BackgroundIcon icon={bgIcon} />}
                <div className="flex items-center space-x-2 pb-2">
                    {icon}
                    <h1 className="w-full text-xl">{titleBar}</h1>
                </div>
                <div className="relative grow">{children}</div>
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
        <div className={className}>
            <div className="light-border flex h-full flex-row rounded-lg bg-white">
                {articles.map((SectionArticle, i) => (
                    <React.Fragment key={i}>
                        {i > 0 ? (
                            <div className="h-[95%] self-center border border-gray-300"></div>
                        ) : undefined}
                        {SectionArticle}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default PageSection;
