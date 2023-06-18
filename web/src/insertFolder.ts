import { postRequest } from "./apiRequest";
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

    return parseInt(await resp.text());
}
