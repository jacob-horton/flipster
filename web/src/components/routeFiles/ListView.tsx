import { getRequest } from "@src/apiRequest";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import ListViewNode, { NodeData } from "./ListViewNode";

const ListView = () => {
    const [folders, setFolders] = useState<NodeData | undefined>(undefined);
    const [selected, setSelected] = useState<number | undefined>(undefined);
    const auth = useAuth();

    useEffect(() => {
        // TODO: properly handle no token
        const token = auth.user?.id_token;
        if (token === undefined || auth.user?.expired) {
            return;
        }

        // Already got folders
        if (folders !== undefined) {
            return;
        }

        const fetchData = async () => {
            const resp = await getRequest({
                path: "/user/top_level_folder",
                id_token: token,
            });

            const id = parseInt(await resp.text());
            setFolders({ children: [], name: "Your Files", id });
        };

        fetchData();
    }, [auth.user, folders]);

    if (folders === undefined) {
        return <p>Loading</p>;
    } else {
        // TODO: load children, but not grandchlidren
        return (
            <ListViewNode
                node={folders}
                expanded={true}
                path={[]}
                selected={selected}
                setSelected={setSelected}
            />
        );
    }
};

export default ListView;
