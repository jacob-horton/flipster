import PageSection from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import Requests from "@components/routeGroups/Requests";
import { getRequest, postRequest } from "@src/apiRequest";
import { GroupGetReq } from "@src/types/GroupGetReq";
import { GroupGetResp } from "@src/types/GroupGetResp";
import { GroupInfoGetReq } from "@src/types/GroupInfoGetReq";
import { GroupInfoGetResp } from "@src/types/GroupInfoGetResp";
import { GroupJoinPostReq } from "@src/types/GroupJoinPostReq";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "react-oidc-context";

async function fetchGroup(
    id_token: string | undefined,
    uuid: string | undefined
) {
    if (id_token === undefined || uuid === undefined) {
        return Promise.reject(new Error("UUID or token not defined"));
    }

    const queryParams: GroupGetReq = { uuid };
    return getRequest({
        path: "/group/get",
        id_token: id_token,
        queryParams,
    }).then(async (resp) => (await resp.json()) as GroupGetResp);
}

const Groups = () => {
    const router = useRouter();
    const auth = useAuth();

    let groupUuid: string | undefined = undefined;
    if (typeof router.query.uuid === "string") {
        groupUuid = router.query.uuid;
    }

    // TODO: combine with group/info endpoint
    const { data: group, isLoading } = useQuery<GroupGetResp>({
        queryKey: ["group", auth.user],
        queryFn: () => fetchGroup(auth.user?.id_token, groupUuid),
        enabled: auth.user?.id_token !== undefined && groupUuid !== undefined,
    });

    const {
        data: groupInfo,
        refetch,
        isLoading: isInfoLoading,
    } = useQuery({
        queryKey: ["group_info", auth.user],
        queryFn: async () => {
            const queryParams: GroupInfoGetReq = { uuid: groupUuid };
            return await getRequest({
                path: "/group/info",
                id_token: auth.user?.id_token ?? "",
                queryParams,
            }).then(async (data) => (await data.json()) as GroupInfoGetResp);
        },
        enabled: auth.user?.id_token !== undefined && groupUuid !== undefined,
    });

    // TODO: get flashcards if member
    console.log(groupInfo);

    return (
        <ProtectedRoute>
            <div className="flex h-full flex-row space-x-4 p-4">
                <PageSection
                    className="w-full justify-between"
                    titleBar={<>Details for group with UUID: {groupUuid}</>}
                >
                    {isLoading || !group || isInfoLoading ? (
                        "Loading"
                    ) : (
                        <div className="space-x-2">
                            {groupInfo?.memberType ? (
                                "Already member "
                            ) : (
                                <button
                                    className="rounded-lg bg-purple-500 px-4 py-2 text-white disabled:bg-purple-200"
                                    onClick={async () => {
                                        const payload: GroupJoinPostReq = {
                                            uuid: group.uuid,
                                        };

                                        const result = await postRequest({
                                            path: "/group/join",
                                            id_token: auth.user?.id_token ?? "",
                                            payload: JSON.stringify(payload),
                                        });

                                        console.log(await result.text());
                                        refetch();
                                    }}
                                    disabled={groupInfo?.isRequestPending}
                                >
                                    {group.isPublic
                                        ? "Join"
                                        : "Request to join"}
                                </button>
                            )}
                            <Link
                                className="rounded-lg bg-gray-200 px-4 py-2"
                                href={`/groups/${groupUuid}/files`}
                            >
                                Files
                            </Link>
                            {groupInfo?.requests?.length ? (
                                <>
                                    <p>
                                        <strong>
                                            {"Requests: "}
                                            {groupInfo?.requests?.length}
                                        </strong>
                                    </p>
                                    <Requests
                                        onAccept={() => refetch()}
                                        id_token={auth.user?.id_token ?? ""}
                                        groupUuid={groupUuid ?? ""}
                                        requests={groupInfo.requests}
                                    />
                                </>
                            ) : (
                                ""
                            )}
                        </div>
                    )}
                </PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Groups;
