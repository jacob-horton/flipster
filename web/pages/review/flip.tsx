import PageSection from "@components/PageSection";

export default function ReviewCard() {
    return (
        <div className="flex h-full items-center p-4">
            <button className="mr-4 h-auto w-6 bg-green-300">{"<"}</button>
            <button className="h-full w-full">
                <PageSection className="h-full"></PageSection>
            </button>
            <button className="ml-4 h-auto w-6 bg-green-300">{">"}</button>
        </div>
    );
}
