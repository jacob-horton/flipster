import Folder from "@components/routeFiles/Folder";
import { SubFolderRename } from "@src/types/SubFolderRename";
import { insertFolder } from "@src/insertFolder";
import { useAuth } from "react-oidc-context";
import { useQuery } from "@tanstack/react-query";
import { Folder as FolderType } from "@src/types/Folder";
import { useEffect, useState } from "react";
import { SubFolderGet } from "@src/types/SubFolderGet";
import {
    getRequest,
    postRequest,
    queryOrDefault,
    queryOrDefaultWithDependency,
} from "@src/apiRequest";

function currentFolderId(path: FolderType[]) {
    if (path.length === 0) return undefined;
    return path[path.length - 1].id;
}

interface IconViewProps {
    onPathChange?: (newPath: FolderType[]) => void;
}

const IconView: React.FC<IconViewProps> = ({ onPathChange }) => {
    const auth = useAuth();

    const [currentPath, setCurrentPath] = useState<FolderType[]>([]);
    const [editingFolder, setEditingFolder] = useState<number | undefined>();

    useEffect(() => {
        if (onPathChange) {
            onPathChange(currentPath);
        }
    }, [currentPath, onPathChange]);

    // Current folders
    // NOTE: `isLoading` doesn't work when `initialData` is set
    //       This is fine as `initialData` is not required if you know when its loading
    // TODO: Some sort of loading animation? May be too fast
    const { data: currentFolders, refetch } = useQuery({
        queryKey: [auth.user?.id_token, currentPath],
        initialData: [],
        queryFn: async (): Promise<FolderType[]> => {
            try {
                // Not yet loaded top level folder
                const folderId = currentFolderId(currentPath);

                return queryOrDefaultWithDependency(
                    async (token, folderId) => {
                        const params: SubFolderGet = { folderId };

                        const subFolders = await getRequest({
                            path: "/user/sub_folders",
                            id_token: token,
                            queryParams: params,
                        });

                        return (await subFolders.json()) as FolderType[];
                    },
                    auth,
                    currentFolders,
                    folderId
                );

                // const token = auth.user?.id_token;
                // if (token === undefined) {
                //     return currentFolders;
                // }
                //
                // const folderId = currentFolderId(currentPath);
                // if (folderId === undefined) {
                //     return currentFolders;
                // }
                //
                //
                // const params: SubFolderGet = { folderId };
                //
                // const subFolders = await getRequest({
                //     path: "/user/sub_folders",
                //     id_token: token,
                //     queryParams: params,
                // });
                //
                // return (await subFolders.json()) as FolderType[];
            } catch (error) {
                console.error("Error fetching data:", error);
                return currentFolders;
            }
        },
    });

    // Load top level folder
    useEffect(() => {
        const fetchTopLevelFolderId = async () => {
            try {
                // Only put top level folder in path if its empty
                if (currentPath.length !== 0) return;

                queryOrDefault(
                    async (token) => {
                        const resp = await getRequest({
                            path: "/user/top_level_folder",
                            id_token: token,
                        });
                        const folderId = parseInt(await resp.text());
                        setCurrentPath([{ id: folderId, name: "Your Files" }]);
                    },
                    auth,
                    undefined
                );
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchTopLevelFolderId();
    }, [auth, currentPath.length]);

    const handleRenameFolder = async (name: string, id: number) => {
        setEditingFolder(undefined);

        const payload: SubFolderRename = {
            newName: name,
            folderId: id,
        };

        queryOrDefault(
            async (token) => {
                await postRequest({
                    path: "/folder/rename",
                    id_token: token,
                    payload: JSON.stringify(payload),
                });

                refetch();
            },
            auth,
            undefined
        );
    };

    const handleOpenFolder = async () => {
        // TODO: Handle no token properly
        const token = auth.user?.id_token;
        if (token === undefined || auth.user?.expired) {
            return;
        }

        // TODO: Handle no folder properly
        const folderId = currentFolderId(currentPath);
        if (folderId === undefined) {
            return;
        }

        const id = await insertFolder(token, folderId);
        setEditingFolder(id);
        refetch();
    };

    return (
        <div className="flex flex-col grow">
            <div className="px-6 flex flex-row space-x-2 text-gray-600">
                {currentPath.map((f, i) => (
                    <div key={f.id} className="flex space-x-2">
                        <button
                            className="hover:text-gray-800"
                            onClick={() => {
                                setCurrentPath((path) => path.slice(0, i + 1));
                            }}
                        >
                            {f.name}
                        </button>
                        {i !== currentPath.length - 1 && <p>{">"}</p>}
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap g-green-500">
                {(currentFolders ?? []).map((folder) => (
                    <Folder
                        key={folder.id}
                        editingName={folder.id === editingFolder}
                        name={folder.name}
                        onDoubleClick={() => {
                            setEditingFolder(folder.id);
                            refetch();
                        }}
                        onClick={() => {
                            setCurrentPath((path) => [...path, folder]);
                        }}
                        onEditingFinish={(name) =>
                            handleRenameFolder(name, folder.id)
                        }
                    />
                ))}
                <Folder add={true} onClick={handleOpenFolder} />
            </div>
        </div>
    );
};

export default IconView;
