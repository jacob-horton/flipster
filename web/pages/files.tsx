import React from "react";
import PageSection from "../src/components/PageSection";
import Folder from "../src/components/routeFiles/Folder";
import ProtectedRoute from "../src/components/ProtectedRoute";

const Files = () => {
  const fileList = [
    "Physics",
    "Poetry",
    "Music",
    "dkghfgkjdfglasldfdslfhsk",
    "Computer Science",
    "ksjdfh akjalfjhslgkjdslfkghlkdsf",
    "ksjdfh akjalfjhs lgkjdslfkghlkdsf",
  ];

  return (
    <ProtectedRoute>
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
