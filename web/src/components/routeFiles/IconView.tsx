import Folder from "@components/routeFiles/Folder";
import { SubFolderRename } from "@src/types/SubFolderRename";
import { insertFolder } from "@src/insertFolder";
import { useAuth } from "react-oidc-context";
import { useQuery } from "@tanstack/react-query";
import { Folder as FolderType } from "@src/types/Folder";
import { useState } from "react";
import { SubFolderGet } from "@src/types/SubFolderGet";
import {
    getRequest,
    postRequest,
    queryOrDefault,
    queryOrDefaultWithDependency,
} from "@src/apiRequest";
import Link from "next/link";
import { getPathString } from "@src/getFileRoute";
import { useRouter } from "next/router";

function currentFolderId(path: FolderType[]) {
    if (path.length === 0) return undefined;
    return path[path.length - 1].id;
}

interface IconViewProps {
    // onPathChange?: (newPath: FolderType[]) => void;
    currentPath: FolderType[];
}

const IconView: React.FC<IconViewProps> = ({ currentPath }) => {
    const auth = useAuth();
    const [editingFolder, setEditingFolder] = useState<number | undefined>();
    const router = useRouter();
    const data = router.query;

    // Current folders
    // NOTE: `isLoading` doesn't work when `initialData` is set
    //       This is fine as `initialData` is not required if you know when its loading
    // TODO: Some sort of loading animation? May be too fast
    const { data: currentFolders, refetch } = useQuery({
        queryKey: [auth.user?.id_token, currentPath],
        initialData: ((data.folders as string[]) ?? []).map((f) => ({
            name: f,
            id: -1,
        })),
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
            } catch (error) {
                console.error("Error fetching data:", error);
                return currentFolders;
            }
        },
    });

    const handleRenameFolder = async (name: string, id: number) => {
        setEditingFolder(undefined);

        const payload: SubFolderRename = {
            newName: name,
            folderId: id,
        };

        return await queryOrDefault(
            async (token) => {
                const resp = await postRequest({
                    path: "/folder/rename",
                    id_token: token,
                    payload: JSON.stringify(payload),
                });

                // If conflict i.e. folder with that name already exists
                if (resp.status === 409) {
                    alert(
                        "Failed to rename - Already have a folder with that name"
                    );
                    return false;
                }

                refetch();
                return true;
            },
            auth,
            false
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

        const folder = await insertFolder(token, folderId);
        setEditingFolder(folder.id);
        refetch();
    };

    return (
        <div className="flex flex-col grow">
            <div className="px-6 flex flex-row space-x-2 text-gray-600">
                {currentPath.map((f, i) => (
                    <div key={f.id} className="flex space-x-2">
                        <Link
                            className="hover:text-gray-800"
                            href={getPathString(currentPath.slice(1, i + 1))}
                        >
                            {f.name}
                        </Link>
                        {i !== currentPath.length - 1 && <p>{">"}</p>}
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap g-green-500">
                {(currentFolders ?? []).map((folder) => (
                    <Folder
                        key={`${folder.id}:${folder.name}`} // Use both id and name for key - in case duplicate names, or ids (in cases of preloading)
                        editingName={folder.id === editingFolder}
                        folder={folder}
                        path={getPathString([...currentPath.slice(1), folder])}
                        onDoubleClick={() => {
                            setEditingFolder(folder.id);
                            refetch();
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
