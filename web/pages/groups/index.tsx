import Button from "@components/Button";
import PageSection from "@components/PageSection";
import Popup from "@components/Popup";
import ProtectedRoute from "@components/ProtectedRoute";
import { getRequest, postRequest } from "@src/apiRequest";
import { GroupInsert } from "@src/types/GroupInsert";
import { GroupSearchGetReq } from "@src/types/GroupSearchGetReq";
import { GroupSearchGetResp } from "@src/types/GroupSearchGetResp";
import { UserGroup } from "@src/types/UserGroup";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { BsFolder } from "react-icons/bs";
import { useAuth } from "react-oidc-context";

const Groups = () => {
    const auth = useAuth();
    const [showPopup, setShowPopup] = useState(false);

    const { data: groups, refetch } = useQuery({
        queryKey: [auth],
        initialData: [],
        queryFn: async () => {
            return (await getRequest({
                path: "/user/groups",
                id_token: auth.user?.id_token ?? "",
            }).then((r) => r.json())) as UserGroup[];
        },
    });

    const [searchGroups, setSearchGroups] = useState<GroupSearchGetResp[]>([]);

    return (
        <ProtectedRoute>
            <Popup show={showPopup} onCancel={() => setShowPopup(false)}>
                <form
                    className="space-y-2"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const target = e.target as typeof e.target & {
                            name: { value: string };
                            description: { value: string };
                            public: { checked: boolean };
                        };

                        const payload: GroupInsert = {
                            description: target.description.value,
                            name: target.name.value,
                            isPublic: target.public.checked,
                        };

                        const result = await postRequest({
                            id_token: auth.user?.id_token ?? "",
                            path: "/group/add",
                            payload: JSON.stringify(payload),
                        });

                        if (result.ok) {
                            setShowPopup(false);
                            refetch();
                        }
                    }}
                >
                    <div>
                        <p className="text-md">Name</p>
                        <input
                            name="name"
                            className="light-border w-full rounded-lg px-2 pb-2 pt-1"
                        />
                    </div>
                    <div>
                        <p className="text-md">Description</p>
                        <input
                            name="description"
                            className="light-border w-full rounded-lg px-2 pb-2 pt-1"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <input name="public" type="checkbox" />
                        <p className="text-md">Public</p>
                    </div>
                    <Button onClick={() => setShowPopup(true)} type="submit">
                        Add Group
                    </Button>
                </form>
            </Popup>
            <div className="flex h-full flex-row space-x-4 p-4">
                <PageSection
                    className="w-full justify-between"
                    titleBar="Your Groups"
                >
                    <div className="flex h-full flex-col justify-between">
                        <div className="space-y-2">
                            {groups.map((g) => (
                                <div className="flex space-x-2" key={g.uuid}>
                                    <Link
                                        href={`/groups/${g.uuid}`}
                                        className="w-full rounded-lg bg-gray-200 px-4 py-1"
                                    >
                                        {g.name}
                                    </Link>
                                    <Link
                                        className="flex items-center rounded-lg bg-gray-200 px-2 py-1"
                                        href={`/groups/${g.uuid}/files`}
                                    >
                                        <BsFolder className="self-center" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <Button onClick={() => setShowPopup(true)}>
                            + New Group
                        </Button>
                    </div>
                </PageSection>
                <PageSection className="w-full" titleBar="Join Groups">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const target = e.target as typeof e.target & {
                                search: { value: string };
                            };

                            // Do not search with empty query
                            if (!target.search.value) return;

                            const queryParams: GroupSearchGetReq = {
                                searchTerm: target.search.value,
                            };

                            setSearchGroups(
                                await getRequest({
                                    path: "/group/search",
                                    id_token: auth.user?.id_token ?? "",
                                    queryParams,
                                }).then(
                                    async (resp) =>
                                        (await resp.json()) as GroupSearchGetResp[]
                                )
                            );

                            console.log(target.search.value);
                        }}
                    >
                        <input
                            name="search"
                            className="light-border w-full rounded-lg bg-gray-100 px-2 py-1"
                        />
                    </form>
                    <div className="flex flex-col">
                        {searchGroups.map((g) => (
                            <Link href={`/groups/${g.uuid}`}>{g.name}</Link>
                        ))}
                    </div>
                </PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Groups;
