import React, { useState } from "react";
import PageSection from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { Folder as FolderType } from "@src/types/Folder";
import ListView from "@components/routeFiles/ListView";
import IconView from "@components/routeFiles/IconView";
import AddFlashcardButtonPopup from "@components/routeFiles/AddFlashcardButtonPopup";

function currentFolderId(path: FolderType[]) {
    if (path.length === 0) return undefined;
    return path[path.length - 1].id;
}

const Files = () => {
    const [currentPath, setCurrentPath] = useState<FolderType[]>([]);
    const [view, setView] = useState<"icon" | "list">("icon");

    return (
        <ProtectedRoute>
            <PageSection
                className="h-full p-4"
                titleBar={
                    <div className="flex flex-row justify-between p-4">
                        <h1 className="text-2xl">Your Files</h1>
                        <select
                            className="px-4 bg-gray-300 text-base rounded-lg"
                            onChange={(e) =>
                                setView(e.target.value as "list" | "icon")
                            }
                            value={view}
                        >
                            <option value="icon">Icon</option>
                            <option value="list">List</option>
                        </select>
                    </div>
                }
            >
                <div className="space-y-6">
                    {view === "icon" && (
                        <IconView
                            onPathChange={(path) => setCurrentPath(path)}
                        />
                    )}
                    {view === "list" && <ListView />}
                    <AddFlashcardButtonPopup
                        currentFolderId={currentFolderId(currentPath)}
                    />
                </div>
            </PageSection>
        </ProtectedRoute>
    );
};

export default Files;
