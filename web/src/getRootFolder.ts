import { getRequest } from "./apiRequest";

// this seems to work?
async function getRootFolder(id_token?: string) {
    // TODO: properly handle no token
    // using loose equivalence on purpose: auth.user can be undefined or null!
    if (id_token == undefined) {
        return;
    }

    const resp = await getRequest({
        path: "/user/top_level_folder",
        id_token,
    });

    const id = parseInt(await resp.text());
    return { children: [], name: "Your Files", id };
}
export default getRootFolder;
