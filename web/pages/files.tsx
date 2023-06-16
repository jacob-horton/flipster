import React from "react";
import PageSection from "../src/components/PageSection";
import { FiFolder } from "react-icons/fi";
import { FiFolderPlus } from "react-icons/fi";
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
            <header className="text-2xl">Your Files</header>
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
              // TODO: Extract into component
              <button key={index} className="m-4 text-gray-800 w-24 align-top">
                <div className="flex justify-center">
                  <span className="text-lg">
                    <FiFolder
                      size={80}
                      strokeWidth={1}
                      className="text-violet-600"
                    />
                  </span>
                </div>
                <p className="line-clamp-2 overflow-hidden text-ellipsis">
                  {filename}
                </p>
              </button>
            ))}
            <button className="p-4 text-gray-400 mb-4">
              <div className="flex justify-center">
                <span className="text-lg">
                  <FiFolderPlus size={80} strokeWidth={1} strokeDasharray={2} />{" "}
                </span>
              </div>
            </button>
          </div>
        </div>
      </PageSection>
    </ProtectedRoute>
  );
};

export default Files;
