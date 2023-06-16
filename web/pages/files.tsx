import React from "react";
import PageSection from "../src/components/PageSection";
import { FiFolder } from "react-icons/fi";
import { FiFolderPlus } from "react-icons/fi";

export default function Files() {
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
        <div className="flex-1 space-x-4 px-4">
          <button className="p-4 text-gray-800 mb-4 rounded-lg">
            <div className="flex">
              <span className="text-lg">
                <FiFolder
                  size={80}
                  strokeWidth={1}
                  className="text-violet-600"
                />
              </span>
            </div>
            <div className="mt-auto">Physics</div>
          </button>
          <button className="p-4 text-gray-800 mb-4 rounded-lg">
            <div className="flex">
              <span className="text-lg">
                <FiFolder
                  size={80}
                  strokeWidth={1}
                  className="text-violet-600"
                />
              </span>
            </div>
            <div className="mt-auto">Poetry</div>
          </button>
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
