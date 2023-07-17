import Login from "./Login";
import { IoRibbon } from "react-icons/io5";

const Profile = () => {
    return (
        <div className="mr-4 flex h-full items-center space-x-4">
            <button>
                <IoRibbon />
            </button>
            <Login />
        </div>
    );
};

export default Profile;
