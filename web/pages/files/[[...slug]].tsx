import React, { useEffect, useState } from "react";
import PageSection from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { Folder as FolderType } from "@src/types/Folder";
import ListView from "@components/routeFiles/ListView";
import IconView from "@components/routeFiles/IconView";
import AddFlashcardButtonPopup from "@components/routeFiles/AddFlashcardButtonPopup";
import { useRouter } from "next/router";
import { getRequest, queryOrDefault } from "@src/apiRequest";
import { AuthContextProps, useAuth } from "react-oidc-context";
import { ResolvePathGet } from "@src/types/ResolvePathGet";

function currentFolderId(path: FolderType[]) {
    if (path.length === 0) return undefined;
    return path[path.length - 1].id;
}

async function getFoldersFromNames(auth: AuthContextProps, names: string) {
    return await queryOrDefault(
        async (token) => {
            const queryParams: ResolvePathGet = { path: names };
            const folders = await getRequest({
                path: "/folder/resolve_path",
                id_token: token,
                queryParams,
            }).then(async (resp) => (await resp.json()) as FolderType[]);

            return folders;
        },
        auth,
        []
    );
}

const Files = () => {
    const [currentPath, setCurrentPath] = useState<FolderType[]>([]);
    const [view, setView] = useState<"icon" | "list">("list");

    const router = useRouter();
    const slug = router.query.slug;

    const auth = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            // TODO: neaten
            if (Array.isArray(slug)) {
                const path = await getFoldersFromNames(auth, slug.join("/"));
                setCurrentPath(path);
            } else {
                const path = await getFoldersFromNames(auth, "/");
                setCurrentPath(path);
            }
        };

        fetchData();
    }, [auth, slug]);

    // TODO: path case insensitive?
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
                    {view === "icon" && <IconView currentPath={currentPath} />}
                    {view === "list" && <ListView currentPath={currentPath} />}
                    <AddFlashcardButtonPopup
                        currentFolderId={currentFolderId(currentPath)}
                    />
                </div>
            </PageSection>
        </ProtectedRoute>
    );
};

export default Files;
