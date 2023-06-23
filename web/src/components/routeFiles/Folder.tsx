import Link from "next/link";
import { MouseEventHandler, useState } from "react";
import { FiFolder } from "react-icons/fi";
import { FiFolderPlus } from "react-icons/fi";

interface FolderProps {
    name?: string;
    add?: boolean;
    onClick?: MouseEventHandler;
    editingName?: boolean;
    onEditingFinish?: (name: string) => Promise<boolean>; // Returns true if rename successful
    onDoubleClick?: () => void;
    path?: string;
}

const Folder: React.FC<FolderProps> = ({
    add,
    editingName,
    name: initialName,
    onClick,
    path,
    onEditingFinish,
    onDoubleClick,
}) => {
    const [name, setName] = useState(initialName ?? "");

    // TODO: force path to be present if add is false
    return (
        <div className="flex flex-col text-gray-800 w-24 m-2">
            <div className="flex justify-center">
                <span className="text-lg">
                    {add ?? false ? (
                        <button onClick={onClick}>
                            <FiFolderPlus
                                size={80}
                                strokeWidth={1}
                                strokeDasharray={2}
                                className="text-gray-400"
                            />
                        </button>
                    ) : (
                        <Link className="hover:text-gray-800" href={path}>
                            <FiFolder
                                size={80}
                                strokeWidth={1}
                                className="text-violet-600"
                            />
                        </Link>
                    )}
                </span>
            </div>
            {editingName ? (
                <input
                    autoFocus={true}
                    className="border-gray-400 border rounded-md px-2 text-center"
                    onChange={(e) => setName(e.target.value)}
                    placeholder={name}
                    onKeyUp={async (e) => {
                        if (e.code === "Enter") {
                            if (onEditingFinish !== undefined) {
                                const result = await onEditingFinish(name);
                                console.log(result);
                                if (!result) {
                                    setName(initialName ?? "");
                                }
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
