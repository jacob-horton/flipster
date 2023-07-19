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
    textType?: boolean;
}

const Folder: React.FC<FolderProps> = ({
    add,
    editingName,
    folder,
    onClick,
    path,
    onEditingFinish,
    onDoubleClick,
    textType,
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

    const handleSaveFolderName = async () => {
        if (onEditingFinish !== undefined) {
            const result = await onEditingFinish(name);
            if (!result) setName(folder?.name ?? "");
        }
    };

    // TODO: force path to be present if add is false
    return (
        <div className="m-2 flex w-24 flex-col">
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
                    className="rounded-md border border-gray-400 px-2 text-center"
                    onChange={(e) => setName(e.target.value)}
                    value={textType ? undefined : name}
                    placeholder={textType ? name : undefined}
                    onBlur={handleSaveFolderName}
                    onKeyUp={async (e) => {
                        if (e.code === "Enter") {
                            handleSaveFolderName();
                        }
                    }}
                />
            ) : (
                <p
                    className="line-clamp-2 overflow-hidden text-ellipsis text-center"
                    onDoubleClick={onDoubleClick}
                >
                    {name}
                </p>
            )}
        </div>
    );
};

export default Folder;
