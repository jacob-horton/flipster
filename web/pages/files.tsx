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
import { SubFolderRename } from "@src/types/SubFolderRename";
import { useQuery } from "@tanstack/react-query";
import { IoIosColorPalette } from "react-icons/io";

function currentFolderId(path: FolderType[]) {
    if (path.length === 0) return undefined;
    return path[path.length - 1].id;
}

const Files = () => {
    // Popup state
    // TODO: Make into form?
    const [showPopup, setShowPopup] = useState(false);
    const [term, setTerm] = useState("");
    const [definition, setDefinition] = useState("");

    const [currentPath, setCurrentPath] = useState<FolderType[]>([]);
    const [editingFolder, setEditingFolder] = useState<number | undefined>();

    const auth = useAuth();

    // Current folders
    // NOTE: `isLoading` doesn't work when `initialData` is set
    //       This is fine as `initialData` is not required if you know when its loading
    // TODO: Some sort of loading animation? May be too fast
    const { data: currentFolders, refetch } = useQuery({
        queryKey: [auth.user?.id_token, currentPath],
        initialData: [],
        queryFn: async (): Promise<FolderType[]> => {
            try {
                // TODO: properly handle no token
                const token = auth.user?.id_token;
                if (token === undefined || auth.user?.expired) {
                    return currentFolders;
                }

                // Not yet loaded top level folder
                const folderId = currentFolderId(currentPath);
                if (folderId === undefined) {
                    return currentFolders;
                }

                const params: SubFolderGet = { folderId };

                const subFolders = await getRequest({
                    path: "/user/sub_folders",
                    id_token: token,
                    queryParams: params,
                });

                return (await subFolders.json()) as FolderType[];
            } catch (error) {
                console.error("Error fetching data:", error);
                return currentFolders;
            }
        },
    });

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
                if (token === undefined || auth.user?.expired) {
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
    }, [auth.user?.id_token, currentPath.length]);

    // TODO: instead of useEffect, do something like https://stackoverflow.com/questions/71124909/react-useeffect-dependencies-invalidation
    const handleAddFlashcard = async () => {
        // TODO: properly handle no token
        const token = auth.user?.id_token;
        if (token === undefined || auth.user?.expired) {
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

    const CheckboxItem = ({ label = "" }) => {
        return (
            <div className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox" />
                <label className="text-gray-700">{label}</label>
            </div>
        );
    };
    const methods: string[] = ["Flip", "Match", "Learn"];
    //TODO don't allow creation of card if term or definition empty
    return (
        <ProtectedRoute>
            <Popup show={showPopup} onCancel={() => setShowPopup(false)}>
                <div className="space-y-2">
                    <h1 className="text-2xl">Create Flashcard</h1>
                    <div>
                        <p className="text-lg">Term</p>
                        <textarea
                            className="px-2 pt-1 pb-2 border-[1.5px] border-black border-opacity-10 rounded-lg w-full"
                            onChange={(e) => setTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <p className="text-lg">Definition</p>
                        <textarea
                            className="px-2 pt-1 pb-20 border-[1.5px] border-black border-opacity-10 rounded-lg w-full"
                            onChange={(e) => setDefinition(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        <div>
                            <h1 className="text-lg">Review Methods</h1>
                            {methods.map((method, index) => (
                                <CheckboxItem key={index} label={method} />
                            ))}
                        </div>
                        <div className="flex flex-col items-center">
                            <h1 className="text-center text-lg">Colour</h1>
                            <div>
                                <button>
                                    <IoIosColorPalette
                                        size={50}
                                        strokeWidth={1}
                                    />
                                </button>
                            </div>
                        </div>
                        <div>
                            <h1 className="flex justify-center text-lg">
                                Similar Cards
                            </h1>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            handleAddFlashcard();
                            setShowPopup(false);
                        }}
                        className="flex justify-center"
                    >
                        + Create
                    </Button>
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
                <div className="flex flex-col grow">
                    <div className="px-6 flex flex-row space-x-2 text-gray-600">
                        {currentPath.map((f, i) => (
                            <div key={f.id} className="flex space-x-2">
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
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap g-green-500">
                        {(currentFolders ?? []).map((folder) => (
                            <Folder
                                key={folder.id}
                                editingName={folder.id === editingFolder}
                                name={folder.name}
                                onDoubleClick={() => {
                                    setEditingFolder(folder.id);
                                    refetch();
                                }}
                                onClick={() => {
                                    setCurrentPath((path) => [...path, folder]);
                                }}
                                onEditingFinish={async (name) => {
                                    setEditingFolder(undefined);

                                    const token = auth.user?.id_token;
                                    if (
                                        token === undefined ||
                                        auth.user?.expired
                                    ) {
                                        return;
                                    }

                                    const payload: SubFolderRename = {
                                        newName: name,
                                        folderId: folder.id,
                                    };

                                    await postRequest({
                                        path: "/folder/rename",
                                        id_token: token,
                                        payload: JSON.stringify(payload),
                                    });

                                    refetch();
                                }}
                            />
                        ))}
                        <Folder
                            add={true}
                            onClick={async () => {
                                // TODO: Handle no token properly
                                const token = auth.user?.id_token;
                                if (token === undefined || auth.user?.expired) {
                                    return;
                                }

                                // TODO: Handle no folder properly
                                const folderId = currentFolderId(currentPath);
                                if (folderId === undefined) {
                                    return;
                                }

                                const id = await insertFolder(token, folderId);
                                setEditingFolder(id);
                                refetch();
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
