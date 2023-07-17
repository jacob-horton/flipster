import React, { useEffect, useState } from "react";
import PageSection from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { Folder as FolderData } from "@src/types/Folder";
import FolderListView from "@components/FolderListView";
import IconView from "@components/routeFiles/IconView";
import AddFlashcardButtonPopup from "@components/routeFiles/AddFlashcardButtonPopup";
import { useRouter } from "next/router";
import { getRequest, queryOrDefault } from "@src/apiRequest";
import { AuthContextProps, useAuth } from "react-oidc-context";
import { ResolvePathGet } from "@src/types/ResolvePathGet";
import { useQuery } from "@tanstack/react-query";
import getTopLevelFolder from "@src/getTopLevelFolder";

function currentFolderId(path: FolderData[]) {
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
            }).then(async (resp) => (await resp.json()) as FolderData[]);

            return folders;
        },
        auth,
        []
    );
}

const Files = () => {
    const [currentPath, setCurrentPath] = useState<FolderData[]>([]);
    const [view, setView] = useState<"icon" | "list">("icon");

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

    const { data: topLevelFolder } = useQuery({
        queryKey: [auth.user],
        queryFn: async () => await getTopLevelFolder(auth.user),
    });
    if (!topLevelFolder) {
        return <ProtectedRoute>{}</ProtectedRoute>;
    }

    // TODO: path case insensitive?
    // TODO: dropdown shows over popup
    return (
        <div className="flex h-full flex-col p-4">
            <PageSection
                className="grow"
                titleBar={
                    <div className="flex flex-row justify-between p-4">
                        <h1 className="text-2xl">Your Files</h1>
                        <select
                            className="rounded-lg bg-gray-300 px-4 text-base"
                            onChange={(e) => {
                                setView(e.target.value as "list" | "icon");
                                if (e.target.value === "list") {
                                    router.replace("/files");
                                }
                            }}
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
                    {view === "list" && (
                        <FolderListView
                            selectMultiple={false}
                            topLevelFolder={topLevelFolder}
                        />
                    )}
                    <AddFlashcardButtonPopup
                        currentFolderId={currentFolderId(currentPath)}
                    />
                </div>
            </PageSection>
        </div>
    );
};

export default Files;
