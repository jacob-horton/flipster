import { AuthContextProps } from "react-oidc-context";
import { getRequest, postRequest } from "./apiRequest";
import { SubFolderInsert } from "./types/SubFolderInsert";

export async function insertFolder(auth: AuthContextProps) {
  const folderResp = await getRequest({
    path: "/user/top_level_folder",
    id_token: auth.user?.id_token ?? "",
  });
  const folderId = parseInt(await folderResp.text());

  const payload: SubFolderInsert = {
    name: "NewFolder",
    parentFolderId: folderId,
  };

  const resp = await postRequest({
    path: "/folder/add",
    id_token: auth.user?.id_token ?? "",
    payload: JSON.stringify(payload),
  });
}
