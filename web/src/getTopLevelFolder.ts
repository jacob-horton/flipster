import { User } from "oidc-client-ts";
import { getRequest } from "./apiRequest";

// this seems to work?
async function getTLF(user?: User | null) {
    // TODO: properly handle no token
    // using loose equivalence on purpose: auth.user can be undefined or null!
    if (user == undefined || user.expired || user.id_token == undefined) {
        return;
    }
    const token = user.id_token;
    const resp = await getRequest({
        path: "/user/top_level_folder",
        id_token: token,
    });

    const id = parseInt(await resp.text());
    return { children: [], name: "Your Files", id };
}
export default getTLF;
