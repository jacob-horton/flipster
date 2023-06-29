import { getRequest } from "@src/apiRequest";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import ListViewNode, { NodeData } from "./ListViewNode";

interface FolderListViewProps {
    selectMultiple: boolean;
    onSelectedFoldersChange?: (folderIds: number[]) => void;
}

const FolderListView: React.FC<FolderListViewProps> = ({
    selectMultiple,
    onSelectedFoldersChange,
}) => {
    const [folders, setFolders] = useState<NodeData | undefined>(undefined);
    const [selected, setSelected] = useState<number[]>([]);
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

    useEffect(() => {
        if (onSelectedFoldersChange) onSelectedFoldersChange(selected);
    }, [selected, onSelectedFoldersChange]);

    if (folders === undefined) {
        return <p>Loading</p>;
    } else {
        return (
            <ListViewNode
                node={folders}
                expanded={true}
                path={[]}
                selected={selected}
                setSelected={(id: number) => {
                    if (selectMultiple) {
                        if (selected.includes(id)) {
                            setSelected(selected.filter((i) => i != id));
                        } else {
                            setSelected((selected) => [...selected, id]);
                        }
                    } else {
                        setSelected([id]);
                    }
                }}
            />
        );
    }
};

export default FolderListView;
