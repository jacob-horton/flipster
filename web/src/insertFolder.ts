import { postRequest } from "./apiRequest";
import { Folder } from "./types/Folder";
import { SubFolderInsert } from "./types/SubFolderInsert";

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

    return (await resp.json()) as Folder;
}
