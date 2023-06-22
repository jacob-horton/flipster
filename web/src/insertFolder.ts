import { getRequest, postRequest } from "./apiRequest";
import { Folder } from "./types/Folder";
import { SubFolderInsert } from "./types/SubFolderInsert";
import { UniqueNameGet } from "./types/UniqueNameGet";

export async function insertFolder(token: string, parentId: number) {
    const payload: SubFolderInsert = {
        name: "Untitled",
        parentFolderId: parentId,
    };

    const resp = await postRequest({
        path: "/folder/add",
        id_token: token,
        payload: JSON.stringify(payload),
    });

    // Conflict - rename
    if (resp.status === 409) {
        const queryParams: UniqueNameGet = {
            name: "Untitled",
            parentFolderId: parentId,
        };
        const name = await getRequest({
            path: "/folder/get_unique_name",
            id_token: token,
            queryParams,
        }).then(async (resp) => await resp.text());

        const payload: SubFolderInsert = {
            name: name,
            parentFolderId: parentId,
        };

        const resp = await postRequest({
            path: "/folder/add",
            id_token: token,
            payload: JSON.stringify(payload),
        });

        return (await resp.json()) as Folder;
    } else {
        return (await resp.json()) as Folder;
    }
}
