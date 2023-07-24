import PageSection from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import Requests from "@components/routeGroups/Requests";
import { getRequest, postRequest } from "@src/apiRequest";
import { GroupInfoGetReq } from "@src/types/GroupInfoGetReq";
import { GroupInfoGetResp } from "@src/types/GroupInfoGetResp";
import { GroupJoinPostReq } from "@src/types/GroupJoinPostReq";
import { GroupLeavePostReq } from "@src/types/GroupLeavePostReq";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "react-oidc-context";

const Groups = () => {
    const router = useRouter();
    const auth = useAuth();

    let groupUuid: string | undefined = undefined;
    if (typeof router.query.uuid === "string") {
        groupUuid = router.query.uuid;
    }

    const {
        data: group,
        refetch,
        isLoading,
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

    return (
        <ProtectedRoute>
            <div className="flex h-full flex-row space-x-4 p-4">
                <PageSection
                    className="w-full justify-between"
                    titleBar={<>Group: {group?.name}</>}
                >
                    {isLoading || !group || !groupUuid ? (
                        "Loading"
                    ) : (
                        <div className="space-x-2">
                            {group.memberType ? (
                                <button
                                    className="rounded-lg bg-red-500 px-4 py-2 text-white disabled:bg-red-200"
                                    onClick={async () => {
                                        const payload: GroupLeavePostReq = {
                                            uuid: group.uuid,
                                        };

                                        await postRequest({
                                            path: "/group/leave",
                                            id_token: auth.user?.id_token ?? "",
                                            payload: JSON.stringify(payload),
                                        });

                                        refetch();
                                    }}
                                    // TODO: Tooltip when disabled - "owners cannot leave their group"
                                    disabled={group.memberType === "owner"}
                                >
                                    Leave group
                                </button>
                            ) : (
                                <button
                                    className="rounded-lg bg-purple-500 px-4 py-2 text-white disabled:bg-purple-200"
                                    onClick={async () => {
                                        const payload: GroupJoinPostReq = {
                                            uuid: group.uuid,
                                        };

                                        await postRequest({
                                            path: "/group/join",
                                            id_token: auth.user?.id_token ?? "",
                                            payload: JSON.stringify(payload),
                                        });

                                        refetch();
                                    }}
                                    disabled={group.isRequestPending}
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
                            {group.requests?.length ? (
                                <Requests
                                    onAccept={() => refetch()}
                                    id_token={auth.user?.id_token ?? ""}
                                    groupUuid={groupUuid ?? ""}
                                    requests={group.requests}
                                />
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
