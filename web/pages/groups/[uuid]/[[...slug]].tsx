import FolderListView from "@components/FolderListView";
import PageSection, { SectionArticle } from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import Requests from "@components/routeGroups/Requests";
import { getRequest, postRequest } from "@src/apiRequest";
import { GroupInfoGetReq } from "@src/types/GroupInfoGetReq";
import { GroupInfoGetResp } from "@src/types/GroupInfoGetResp";
import { GroupJoinPostReq } from "@src/types/GroupJoinPostReq";
import { GroupLeavePostReq } from "@src/types/GroupLeavePostReq";
import { useQuery } from "@tanstack/react-query";
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

    return (
        <ProtectedRoute>
            <div className="flex h-full flex-row space-x-4 p-4">
                <PageSection
                    className="w-full justify-between"
                    articles={[
                        <SectionArticle
                            titleBar={
                                <p className="font-semibold">{group?.name}</p>
                            }
                            className="w-full"
                        >
                            {isLoading || !group || !groupUuid ? (
                                "Loading"
                            ) : (
                                <div className="space-x-2">
                                    {group.memberType ? (
                                        <button
                                            className="absolute bottom-4 right-4 rounded-lg bg-red-500 px-4 py-2 text-white disabled:bg-red-200"
                                            onClick={async () => {
                                                const payload: GroupLeavePostReq =
                                                    {
                                                        uuid: group.uuid,
                                                    };

                                                await postRequest({
                                                    path: "/group/leave",
                                                    id_token:
                                                        auth.user?.id_token ??
                                                        "",
                                                    payload:
                                                        JSON.stringify(payload),
                                                });

                                                refetch();
                                            }}
                                            // TODO: Tooltip when disabled - "owners cannot leave their group"
                                            disabled={
                                                group.memberType === "owner"
                                            }
                                        >
                                            Leave group
                                        </button>
                                    ) : (
                                        <button
                                            className="absolute bottom-4 right-4 rounded-lg bg-purple-500 px-4 py-2 text-white disabled:bg-purple-200"
                                            onClick={async () => {
                                                const payload: GroupJoinPostReq =
                                                    {
                                                        uuid: group.uuid,
                                                    };

                                                await postRequest({
                                                    path: "/group/join",
                                                    id_token:
                                                        auth.user?.id_token ??
                                                        "",
                                                    payload:
                                                        JSON.stringify(payload),
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
                                </div>
                            )}
                            {group?.rootFolder ? (
                                <>
                                    <p className="text-xl py-2">Group Files:</p>{" "}
                                    {router.query.slug?.join("/")}
                                    <FolderListView
                                        selectMultiple={false}
                                        rootFolder={{
                                            id: group.rootFolder,
                                            name: "All",
                                            children: [],
                                        }}
                                    />
                                </>
                            ) : (
                                <p className="py-2">
                                    You do not have permission to view these
                                    files
                                </p>
                            )}
                        </SectionArticle>,

                        <SectionArticle
                            titleBar={<p className="font-semibold">Info</p>}
                            className="w-full"
                        >
                            {" "}
                            <div>
                                {group?.description}
                                <p className="text-xl pt-2">Members:</p>

                                {group?.requests?.length ? (
                                    <Requests
                                        onAccept={() => refetch()}
                                        id_token={auth.user?.id_token ?? ""}
                                        groupUuid={groupUuid ?? ""}
                                        requests={group.requests}
                                    />
                                ) : (
                                    ""
                                )}

                                {group?.members.map((member, index) => (
                                    <div key={index}>
                                        {`${member.firstName} ${member.lastName} | ${member.role}`}
                                    </div>
                                ))}
                            </div>
                        </SectionArticle>,
                    ]}
                ></PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Groups;
