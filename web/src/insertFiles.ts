import { AuthContextProps } from "react-oidc-context";
import { getRequest, postRequest } from "./apiRequest";
import { SubFolderInsert } from "./types/SubFolderInsert";

export async function insertFolder(auth: AuthContextProps) {
  const token = auth.user?.id_token;
  // TODO: Handle no token properly
  if (token === undefined) {
    return;
  }
  const folderResp = await getRequest({
    path: "/user/top_level_folder",
    id_token: token,
  });
  const folderId = parseInt(await folderResp.text());

  const payload: SubFolderInsert = {
    name: "NewFolder",
    parentFolderId: folderId,
  };

  const resp = await postRequest({
    path: "/folder/add",
    id_token: token,
    payload: JSON.stringify(payload),
  });
}
