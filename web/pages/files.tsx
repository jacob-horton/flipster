import React, { useEffect, useState } from "react";
import PageSection from "@components/PageSection";
import Folder from "@components/routeFiles/Folder";
import ProtectedRoute from "@components/ProtectedRoute";
import Button from "@components/Button";
import { FlashcardInsert } from "@type/FlashcardInsert";
import { SubFolderGet } from "@type/SubFolderGet";
import { useAuth } from "react-oidc-context";
import { getRequest, postRequest } from "@src/apiRequest";
import { insertFolder } from "@src/insertFolder";
import Popup from "@components/Popup";
import { Folder as FolderType } from "@src/types/Folder";

function currentFolderId(path: FolderType[]) {
    if (path.length === 0) return undefined;
    return path[path.length - 1].id;
}

const Files = () => {
    // Popup state
    const [showPopup, setShowPopup] = useState(false);
    const [term, setTerm] = useState("");
    const [definition, setDefinition] = useState("");

    // Refreshing UI
    const [update, setUpdate] = useState(false);

    // Current folders/path
    const [currentFolders, setCurrentFolders] = useState<FolderType[]>([]);
    const [currentPath, setCurrentPath] = useState<FolderType[]>([]);

    const auth = useAuth();

    const refresh = () => {
        setUpdate((prev) => !prev);
    };

    // Load top level folder
    useEffect(() => {
        const fetchTopLevelFolderId = async () => {
            try {
                // Only put top level folder in path if its empty
                if (currentPath.length !== 0) {
                    return;
                }

                // TODO: properly handle no token
                const token = auth.user?.id_token;
                if (token === undefined) {
                    return;
                }

                const resp = await getRequest({
                    path: "/user/top_level_folder",
                    id_token: token,
                });

                const folderId = parseInt(await resp.text());
                setCurrentPath([{ id: folderId, name: "Your Files" }]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchTopLevelFolderId();
    }, [auth.user?.id_token]);

    // Load contents of current folder
    useEffect(() => {
        const fetchData = async () => {
            try {
                // TODO: properly handle no token
                const token = auth.user?.id_token;
                if (token === undefined) {
                    return;
                }

                // Not yet loaded top level folder
                const folderId = currentFolderId(currentPath);
                if (folderId === undefined) {
                    return;
                }

                const params: SubFolderGet = { folderId };

                const files = await getRequest({
                    path: "/user/sub_folders",
                    id_token: token,
                    queryParams: params,
                });

                setCurrentFolders(await files.json());
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [auth.user?.id_token, currentPath, update]);

    // TODO: instead of useEffect, do something like https://stackoverflow.com/questions/71124909/react-useeffect-dependencies-invalidation
    const handleAddFlashcard = async () => {
        // TODO: properly handle no token
        const token = auth.user?.id_token;
        if (token === undefined) {
            return;
        }

        // Not yet loaded top level folder - TODO: error?
        const folderId = currentFolderId(currentPath);
        if (folderId === undefined) {
            return;
        }

        // Create payload with required data
        const payload: FlashcardInsert = {
            term,
            definition,
            folderId,
        };

        // POST the payload
        // TODO: properly handle error
        await postRequest({
            path: "/flashcard/add",
            id_token: token,
            payload: JSON.stringify(payload),
        });
    };

    return (
        <ProtectedRoute>
            <Popup show={showPopup} onCancel={() => setShowPopup(false)}>
                <div className="space-y-2">
                    <div>
                        <p>Term</p>
                        <input
                            className="px-2 py-1 border-[1.5px] border-black border-opacity-10 rounded-lg"
                            onChange={(e) => setTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <p>Definition</p>
                        <input
                            className="px-2 py-1 border-[1.5px] border-black border-opacity-10 rounded-lg"
                            onChange={(e) => setDefinition(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddFlashcard}>Add</Button>
                </div>
            </Popup>
            <PageSection
                className="h-full p-4"
                titleBar={
                    <div className="flex flex-row justify-between p-4">
                        <h1 className="text-2xl">Your Files</h1>
                        <select className="px-4 bg-gray-300 text-base rounded-lg">
                            <option value="icon">Icon</option>
                            <option value="list">List</option>
                        </select>
                    </div>
                }
            >
                <div className="flex flex-col">
                    <div className="px-6 flex flex-row space-x-2 text-gray-600">
                        {currentPath.map((f, i) => (
                            <>
                                <button
                                    className="hover:text-gray-800"
                                    onClick={() => {
                                        setCurrentPath((path) =>
                                            path.slice(0, i + 1)
                                        );
                                    }}
                                >
                                    {f.name}
                                </button>
                                {i !== currentPath.length - 1 && <p>{">"}</p>}
                            </>
                        ))}
                    </div>
                    <div className="flex-1">
                        {currentFolders.map((folder, index) => (
                            <Folder
                                name={folder.name}
                                key={index}
                                onClick={() => {
                                    setCurrentPath((path) => [...path, folder]);
                                }}
                            />
                        ))}
                        <Folder
                            add={true}
                            onClick={async () => {
                                // TODO: Handle no token properly
                                const token = auth.user?.id_token;
                                if (token === undefined) {
                                    return;
                                }

                                // TODO: Handle no folder properly
                                const folderId = currentFolderId(currentPath);
                                if (folderId === undefined) {
                                    return;
                                }

                                await insertFolder(token, folderId);
                                refresh();
                            }}
                        />
                    </div>
                    <Button onClick={() => setShowPopup(true)}>
                        Create flashcard!
                    </Button>
                </div>
            </PageSection>
        </ProtectedRoute>
    );
};

export default Files;
