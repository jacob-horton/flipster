import { getRequest } from "@src/apiRequest";
import { Folder } from "@src/types/Folder";
import { SubFolderGet } from "@src/types/SubFolderGet";
import { useEffect, useState } from "react";
import { BsFolder2, BsFolder2Open } from "react-icons/bs";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { useAuth } from "react-oidc-context";

export interface NodeData {
    children: NodeData[];
    name: string;
    id: number;
}

interface ListViewNodeProps {
    node: NodeData;
    path: Folder[];
    expanded?: boolean;
    selected: number[];
    setSelected: (selected: number) => void;
    shouldLoadChildren?: boolean;
}

const ListViewNode: React.FC<ListViewNodeProps> = ({
    node: initialNode,
    expanded: initialExpanded,
    selected,
    setSelected,
    path,
    shouldLoadChildren,
}) => {
    const [node, setNode] = useState(initialNode);
    const [expanded, setExpanded] = useState(initialExpanded ?? false);
    const [loadedChilren, setLoadedChildren] = useState(false);

    const auth = useAuth();

    useEffect(() => {
        async function loadChildren() {
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

            setLoadedChildren(true);
        }

        if (shouldLoadChildren || (!loadedChilren && expanded)) {
            loadChildren();
        }
    }, [expanded, auth, loadedChilren, node.id, shouldLoadChildren]);

    return (
        <div>
            <div className="flex flex-row items-center">
                <button
                    className="mx-1 rounded-lg p-1 transition hover:bg-gray-200"
                    onClick={() => setExpanded((e) => !e)}
                >
                    {expanded ? <IoIosArrowDown /> : <IoIosArrowForward />}
                </button>
                <button
                    onClick={() => setSelected(node.id)}
                    onDoubleClick={() => {
                        setSelected(node.id);
                        setExpanded((e) => !e);
                    }}
                    className={`flex items-center space-x-2 rounded-lg px-2 py-1 transition ${selected.includes(node.id)
                            ? "bg-purple-200"
                            : "hover:bg-gray-200"
                        } `}
                >
                    {expanded ? <BsFolder2Open /> : <BsFolder2 />}
                    <p>{node.name}</p>
                </button>
            </div>
            <div className={`pl-6 ${expanded ? "" : "hidden"}`}>
                {node.children.length === 0 ? (
                    <p className="pl-4 text-gray-400">No folders</p>
                ) : (
                    <div className="flex flex-col">
                        {node.children.map((n) => (
                            <ListViewNode
                                key={n.id}
                                node={n}
                                path={[...path, node]}
                                selected={selected}
                                setSelected={setSelected}
                                shouldLoadChildren={expanded}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListViewNode;
