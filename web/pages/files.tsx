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

const Files = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [term, setTerm] = useState("");
    const [definition, setDefinition] = useState("");
    const [update, setUpdate] = useState(false);
    const [fileList, setFileList] = useState<string[]>([]);

    const auth = useAuth();

    const refresh = () => {
        setUpdate((prev) => !prev);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
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

                const params: SubFolderGet = { folderId };
                const files = await getRequest({
                    path: "/user/sub_folders",
                    id_token: token,
                    queryParams: params,
                });

                setFileList(await files.json());
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [auth.user?.id_token, update]);

    // TODO: instead of useEffect, do something like https://stackoverflow.com/questions/71124909/react-useeffect-dependencies-invalidation
    const handleAddFlashcard = async () => {
        // TODO: properly handle no token
        const token = auth.user?.id_token;
        if (token === undefined) {
            return;
        }

        // Get top level folder
        // TODO: Change to use current folder
        const resp = await getRequest({
            path: "/user/top_level_folder",
            id_token: token,
        });

        // TODO: properly handle error
        if (resp === undefined) {
            return;
        }

        const folderId = parseInt(await resp.text());

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
                <div className="flex">
                    <div className="flex-1">
                        {fileList.map((filename, index) => (
                            <Folder name={filename} key={index} />
                        ))}
                        <Folder
                            add={true}
                            onClick={async () => {
                                await insertFolder(auth);
                                refresh();
                            }}
                        />
                    </div>
                </div>
                <Button onClick={() => setShowPopup(true)}>
                    Create flashcard!
                </Button>
            </PageSection>
        </ProtectedRoute>
    );
};

export default Files;
