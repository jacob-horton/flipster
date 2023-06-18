import { MouseEventHandler, useState } from "react";
import { FiFolder } from "react-icons/fi";
import { FiFolderPlus } from "react-icons/fi";

interface FolderProps {
    name?: string;
    add?: boolean;
    onClick?: MouseEventHandler;
    editingName?: boolean;
    onEditingFinish?: (name: string) => void;
    onDoubleClick?: () => void;
}

const Folder: React.FC<FolderProps> = ({
    add,
    editingName,
    name: initialName,
    onClick,
    onEditingFinish,
    onDoubleClick,
}) => {
    const [name, setName] = useState(initialName ?? "");

    return (
        <div className="flex flex-col text-gray-800 w-24 m-2">
            <div className="flex justify-center">
                <span className="text-lg">
                    <button onClick={onClick}>
                        {add ?? false ? (
                            <FiFolderPlus
                                size={80}
                                strokeWidth={1}
                                strokeDasharray={2}
                                className="text-gray-400"
                            />
                        ) : (
                            <FiFolder
                                size={80}
                                strokeWidth={1}
                                className="text-violet-600"
                            />
                        )}
                    </button>
                </span>
            </div>
            {editingName ? (
                <input
                    autoFocus={true}
                    className="border-gray-400 border rounded-md px-2 text-center"
                    onChange={(e) => setName(e.target.value)}
                    placeholder={name}
                    onKeyUp={(e) => {
                        if (e.code === "Enter") {
                            if (onEditingFinish !== undefined) {
                                onEditingFinish(name);
                            }
                        }
                    }}
                />
            ) : (
                <p
                    className="text-center line-clamp-2 overflow-hidden text-ellipsis"
                    onDoubleClick={onDoubleClick}
                >
                    {name}
                </p>
            )}
        </div>
    );
};

export default Folder;
