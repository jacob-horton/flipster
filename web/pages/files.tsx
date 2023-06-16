import React from "react";
import PageSection from "../src/components/PageSection";
import { FiFolder } from "react-icons/fi";
import { FiFolderPlus } from "react-icons/fi";

export default function Files() {
  const fileList = ["Physics", "Poetry", "Music"];

  return (
    <PageSection
      className="h-full p-4"
      titleBar={
        <div className="flex flex-row justify-between p-4">
          <header className="text-2xl">Your Files</header>
          <select className="px-4 bg-gray-800 text-white rounded-lg">
            <option value="icon">Icon</option>
            <option value="list">List</option>
          </select>
        </div>
      }
    >
      <div className="flex">
        <div className="flex-1 px-4">
          {fileList.map((filename, index) => (
            <button
              key={index}
              className="p-4 text-gray-800 mb-4 rounded-lg overflow-ellipsis w-32"
            >
              <div className="flex">
                <span className="text-lg">
                  <FiFolder
                    size={80}
                    strokeWidth={1}
                    className="text-violet-600"
                  />
                </span>
              </div>
              <p className="truncate">{filename}</p>
            </button>
          ))}
          <button className="p-4 text-gray-800 mb-4 rounded-lg">
            <div className="flex">
              <span className="text-lg">
                <FiFolderPlus size={80} strokeWidth={1} strokeDasharray={2} />{" "}
              </span>
            </div>
          </button>
        </div>
      </div>
    </PageSection>
  );
}
