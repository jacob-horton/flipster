import PageSection from "@components/PageSection";
import { useRouter } from "next/router";

() => {
    return;
    <div className="h-full flex items-center p-4">
        <button className="h-auto w-6 mr-4 bg-green-300">{"<"}</button>
        <button className="h-full w-full">
            <PageSection className="h-full"></PageSection>
        </button>
        <button className="h-auto w-6 ml-4 bg-green-300">{">"}</button>
    </div>;
};

const Review = () => {
    const { query } = useRouter();
    return <div className="">hello</div>;
};
export default Review;
