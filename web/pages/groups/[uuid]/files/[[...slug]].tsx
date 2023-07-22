import FolderListView from "@components/FolderListView";
import PageSection from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { getRequest } from "@src/apiRequest";
import { GroupGetReq } from "@src/types/GroupGetReq";
import { GroupGetResp } from "@src/types/GroupGetResp";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useAuth } from "react-oidc-context";

const Groups = () => {
    const auth = useAuth();
    const router = useRouter();

    let groupUuid: string | undefined = undefined;
    if (typeof router.query.uuid === "string") {
        groupUuid = router.query.uuid;
    }

    const { data: group } = useQuery({
        queryKey: [auth, groupUuid],
        queryFn: async () => {
            if (groupUuid === undefined) {
                return null;
            }

            const queryParams: GroupGetReq = { uuid: groupUuid };
            return (await getRequest({
                path: "/group/get",
                id_token: auth.user?.id_token ?? "",
                queryParams,
            }).then((r) => r.json())) as GroupGetResp;
        },
    });

    return (
        <ProtectedRoute>
            <div className="flex h-full flex-row space-x-4 p-4">
                <PageSection
                    className="w-full justify-between"
                    titleBar={<>Files for group with UUID: {groupUuid}</>}
                >
                    Path: {router.query.slug?.join("/")}
                    <FolderListView
                        selectMultiple={false}
                        rootFolder={{
                            id: group?.rootFolder,
                            name: "asdf",
                            children: [],
                        }}
                    />
                </PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Groups;