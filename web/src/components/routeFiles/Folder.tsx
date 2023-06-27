import { getRequest } from "@src/apiRequest";
import { Folder } from "@src/types/Folder";
import { SubFolderGet } from "@src/types/SubFolderGet";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MouseEventHandler, useState } from "react";
import { FiFolder } from "react-icons/fi";
import { FiFolderPlus } from "react-icons/fi";
import { useAuth } from "react-oidc-context";

interface FolderProps {
    folder?: Folder;
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
    folder,
    onClick,
    path,
    onEditingFinish,
    onDoubleClick,
}) => {
    const [name, setName] = useState(folder?.name ?? "");
    const auth = useAuth();

    const { data: children } = useQuery({
        queryKey: [folder?.id],
        initialData: [],
        queryFn: async (): Promise<Folder[]> => {
            if (folder) {
                const queryParams: SubFolderGet = { folderId: folder.id };

                // TODO: handle id_token better
                const resp = await getRequest({
                    path: "/user/sub_folders",
                    id_token: auth.user?.id_token ?? "",
                    queryParams,
                });
                return (await resp.json()) as Folder[];
            }

            return [];
        },
    });

    // TODO: force path to be present if add is false
    return (
        <div className="flex flex-col w-24 m-2">
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
                        <Link
                            href={{
                                pathname: path ?? "",
                                query: {
                                    folders: children.map((c) => c.name),
                                },
                            }}
                            as={path ?? ""}
                        >
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

                                if (!result) setName(folder?.name ?? "");
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
