import Login from "./Login";
import { IoRibbon } from "react-icons/io5";

const Profile = () => {
  return (
    <div className="h-full flex space-x-4 items-center mr-4">
      {/* TODO: achievement icon */}
      <button>
        <IoRibbon />
      </button>
      <Login />
    </div>
  );
};

export default Profile;
