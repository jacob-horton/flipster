import { BsCalendar2Week } from "react-icons/bs";
import PageSection from "../PageSection";

const Calendar = () => {
    return (
        <PageSection
            className="col-span-4"
            titleBar="Calendar"
            icon={
                <BsCalendar2Week
                    size={28}
                    className="text-gray-800"
                    strokeWidth={0.2}
                />
            }
            bgIcon={<BsCalendar2Week size={200} />}
        ></PageSection>
    );
};

export default Calendar;
