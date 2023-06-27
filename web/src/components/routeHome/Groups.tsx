import PageSection from "../PageSection";
import { MdGroups } from "react-icons/md";

const Groups = () => {
    return (
        <PageSection
            className="col-span-2"
            titleBar="Groups"
            icon={<MdGroups size={28} className="space-x-4 space-y-4" />}
            bgIcon={<MdGroups size={200} />}
        ></PageSection>
    );
};

export default Groups;
