import React from "react";
import { useEffect } from "react";
import PageSection from "../src/components/PageSection";

export default function file() {

    return (
        <PageSection className="h-full p-4">
            <div className="w-full">
                <div className="flex flex-row justify-between p-4">
                    <header className="text-2xl">
                        Your Files
                    </header>
                    <select className=" px-4 bg-gray-800 text-white rounded-lg">
                        <option value="icon">Icon</option>
                        <option value='list'>List</option>
                    </select>
                </div>
                <div className="flex">
                    <div className="flex-1 space-x-4 px-4">
                        <button className="p-4 bg-gray-800 text-white mb-4 rounded-lg">
                            <div className="flex">
                                <span className="text-lg">Folder Icon</span>
                            </div>
                            <div className="mt-auto">
                                Physics
                            </div>
                        </button>
                        <button className="p-4 bg-gray-800 text-white rounded-lg mb-4">
                            <div className="flex">
                                <span className="text-lg">Folder Icon</span>
                            </div>
                            <div className="mt-auto">
                                Poetry
                            </div>
                        </button>
                        <button className="p-4 bg-gray-800 text-white rounded-lg">
                            <div className="flex">
                                <span className="text-lg">Add Folder </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </PageSection>
    );
}