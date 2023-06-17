import React, { useEffect, useState } from "react";
import PageSection from "../src/components/PageSection";
import Folder from "../src/components/routeFiles/Folder";
import ProtectedRoute from "../src/components/ProtectedRoute";
import Button from "../src/components/Button";
import { FlashcardInsert } from "../src/types/FlashcardInsert";
import { useAuth } from "react-oidc-context";
import { getRequest, postRequest } from "../src/apiRequest";
import { insertFolder } from "../src/insertFiles";

const Files = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");

  const auth = useAuth();

  const [fileList, setFileList] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await getRequest({
          path: "/user/top_level_folder",
          id_token: auth.user?.id_token ?? "",
        });
        const folderId = await resp.text();

        const files = await getRequest({
          path: "/user/sub_folders",
          id_token: auth.user?.id_token ?? "",
          queryParams: [{ parameter: "folderId", val: folderId }],
        });
        setFileList(await files.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddFlashcard = async () => {
    // Get top level folder
    // TODO: Change to use current folder
    // TODO: Handle undefined token properly
    let resp = await getRequest({
      path: "/user/top_level_folder",
      id_token: auth.user?.id_token ?? "",
    });

    const folderId = parseInt(await resp.text());

    // Create payload with required data
    const payload: FlashcardInsert = {
      term,
      definition,
      folderId,
    };

    // POST the payload
    // TODO: Handle undefined token properly
    resp = await postRequest({
      path: "/flashcard/add",
      id_token: auth.user?.id_token ?? "",
      payload: JSON.stringify(payload),
    });

    // Print out response (not necessary)
    console.log(await resp.text());
  };

  return (
    <ProtectedRoute>
      <div
        className={
          (showPopup ? "" : "hidden") +
          " fixed w-64 h-64 bg-red-500 z-20 left-0 top-0"
        }
      >
        <p>Term</p>
        <input onChange={(e) => setTerm(e.target.value)}></input>
        <p>Definition</p>
        <input onChange={(e) => setDefinition(e.target.value)}></input>
        <Button onClick={handleAddFlashcard}>Add</Button>
      </div>
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
            <Folder add={true} onClick={() => insertFolder(auth)} />
          </div>
        </div>
      </PageSection>
    </ProtectedRoute>
  );
};

export default Files;
