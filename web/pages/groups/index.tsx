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
    const debounce = (func: typeof handleSearch, delay: number) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        return (searchTerm: string) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(searchTerm);
            }, delay);
        };
    };

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

    const handleSearch = async (searchTerm: string) => {
        // Do not search with empty query
        if (!searchTerm) return;

        const queryParams: GroupSearchGetReq = {
            searchTerm,
        };

        setSearchGroups(
            await getRequest({
                path: "/group/search",
                id_token: auth.user?.id_token ?? "",
                queryParams,
            }).then(async (resp) => (await resp.json()) as GroupSearchGetResp[])
        );
    };

    const debounceDelay = 500;
    const debouncedSearch = debounce(handleSearch, debounceDelay);

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
                        onSubmit={(e) => {
                            const target = e.target as typeof e.target & {
                                search: { value: string };
                            };
                            e.preventDefault();
                            handleSearch(target.search.value);
                        }}
                    >
                        <div className="flex items-center pb-1">
                            <input
                                name="search"
                                className="light-border w-full rounded-lg bg-gray-100 px-2 py-1 pr-10"
                                placeholder="&#128269; Search..."
                                onChange={(e) =>
                                    debouncedSearch(e.target.value)
                                }
                            />
                            <button
                                className="light-border bg-gray-100 rounded-lg px-4 py-1 ml-2"
                                type="submit"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                    <div className="flex flex-col">
                        {searchGroups.map((g) => (
                            <Link
                                href={`/groups/${g.uuid}`}
                                className="flex items-center"
                            >
                                <div className="flex-1 p-1 light-border rounded-lg ">
                                    {g.name}
                                </div>
                                <div className="px-2 p-1 light-border rounded-lg ">
                                    {g.isPublic ? "Public" : "Private"}
                                </div>
                            </Link>
                        ))}
                    </div>
                </PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Groups;
