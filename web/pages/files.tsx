import React, { useEffect, useState } from "react";
import PageSection from "../src/components/PageSection";
import Folder from "../src/components/routeFiles/Folder";
import ProtectedRoute from "../src/components/ProtectedRoute";
import Button from "../src/components/Button";
import { FlashcardInsert } from "../src/types/FlashcardInsert";
import { useAuth } from "react-oidc-context";
import { getRequest, postRequest } from "../src/apiRequest";

const Files = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");

  const auth = useAuth();

  const [fileList, setFileList] = useState<string[]>([]);

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
        const folderId = await resp.text();

        const files = await getRequest({
          path: "/user/sub_folders",
          id_token: token,
          queryParams: [{ parameter: "folderId", val: folderId }],
        });

        setFileList(await files.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // TODO: instead of useEffect, do something like https://stackoverflow.com/questions/71124909/react-useeffect-dependencies-invalidation
  const handleAddFlashcard = async () => {
    // TODO: properly handle no token
    const token = auth.user?.id_token;
    if (token === undefined) {
      return;
    }

    // Get top level folder
    // TODO: Change to use current folder
    let resp = await getRequest({
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
            <Folder add={true} />
          </div>
        </div>
      </PageSection>
    </ProtectedRoute>
  );
};

export default Files;
