import PageSection from "../PageSection";
import { MdGroups } from "react-icons/md";

const Groups = () => {
  return (
    <PageSection
      titleBar="Groups"
      icon={
        <MdGroups size={28} className="text-gray-800 space-x-4 space-y-4" />
      }
      bgIcon={<MdGroups size={200} />}
    ></PageSection>
  );
};

export default Groups;
