import { getRequest } from "@src/apiRequest";
import { Folder } from "@src/types/Folder";
import { SubFolderGet } from "@src/types/SubFolderGet";
import { useState } from "react";
import { AiOutlineFolder, AiOutlineFolderOpen } from "react-icons/ai";
import { useAuth } from "react-oidc-context";

export interface NodeData {
    children: NodeData[];
    name: string;
    id: number;
}

interface ListViewNodeProps {
    node: NodeData;
}

// TODO: function to return current path
// TODO: only select one path
const ListViewNode: React.FC<ListViewNodeProps> = ({ node: initialNode }) => {
    const [node, setNode] = useState(initialNode);
    const [expanded, setExpanded] = useState(false);
    const [loadedChilren, setLoadedChildren] = useState(false);
    const [selected, setSelected] = useState(false);

    const auth = useAuth();

    const handleOpenFolder = async () => {
        if (!loadedChilren) {
            // TODO: properly handle no token
            const token = auth.user?.id_token;
            if (token === undefined || auth.user?.expired) {
                return;
            }

            const params: SubFolderGet = { folderId: node.id };

            const resp = await getRequest({
                path: "/user/sub_folders",
                id_token: token,
                queryParams: params,
            });

            // Update children of this node
            const subFolders = (await resp.json()) as Folder[];
            setNode((n) => ({
                ...n,
                children: subFolders.map((f) => ({
                    id: f.id,
                    name: f.name,
                    children: [],
                })),
            }));

            setLoadedChildren(false);
        }

        setExpanded((e) => !e);
    };

    return (
        <div>
            <button
                className="flex flex-row items-center"
                onClick={() => setSelected((s) => !s)}
                onDoubleClick={handleOpenFolder}
            >
                <div className="px-2">
                    {expanded ? <AiOutlineFolderOpen /> : <AiOutlineFolder />}
                </div>
                <p
                    className={`${selected ? "bg-purple-200" : "hover:bg-gray-200"
                        } px-2 py-1 rounded-lg`}
                >
                    {node.name}
                </p>
            </button>
            <div className={`pl-6 ${expanded ? "" : "hidden"}`}>
                {node.children.length === 0 ? (
                    <p className="text-gray-400 pl-4">No folders</p>
                ) : (
                    <div className="flex flex-col">
                        {node.children.map((n) => (
                            <ListViewNode key={n.id} node={n} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListViewNode;