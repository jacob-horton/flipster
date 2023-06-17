import { MouseEventHandler } from "react";
import { FiFolder } from "react-icons/fi";
import { FiFolderPlus } from "react-icons/fi";

interface FolderProps {
  name?: string;
  add?: boolean;
  onClick?: MouseEventHandler;
}

const Folder: React.FC<FolderProps> = ({ add, name, onClick }) => {
  return (
    <button className="m-4 text-gray-800 w-24 align-top" onClick={onClick}>
      <div className="flex justify-center">
        <span className="text-lg">
          {add ?? false ? (
            <FiFolderPlus
              size={80}
              strokeWidth={1}
              strokeDasharray={2}
              className="text-gray-400"
            />
          ) : (
            <FiFolder size={80} strokeWidth={1} className="text-violet-600" />
          )}
        </span>
      </div>
      <p className="line-clamp-2 overflow-hidden text-ellipsis">{name}</p>
    </button>
  );
};

export default Folder;
