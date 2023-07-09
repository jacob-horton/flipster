import Button from "@components/Button";
import PageSection from "@components/PageSection";
import Popup from "@components/Popup";
import ProtectedRoute from "@components/ProtectedRoute";
import { getRequest, postRequest } from "@src/apiRequest";
import { GroupInsert } from "@src/types/GroupInsert";
import { UserGroup } from "@src/types/UserGroup";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
                            className="px-2 pt-1 pb-2 light-border rounded-lg w-full"
                        />
                    </div>
                    <div>
                        <p className="text-md">Description</p>
                        <input
                            name="description"
                            className="px-2 pt-1 pb-2 light-border rounded-lg w-full"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <input name="public" type="checkbox" />
                        <p className="text-md">Public</p>
                    </div>
                    <Button onClick={() => setShowPopup(true)} submit>
                        Add Group
                    </Button>
                </form>
            </Popup>
            <div className="p-4 h-full flex flex-row space-x-4">
                <PageSection
                    className="w-full justify-between"
                    titleBar={<>Your Groups</>}
                >
                    <div className="justify-between h-full flex flex-col">
                        <div>
                            {groups.map((g) => (
                                <p key={g.id}>{g.name}</p>
                            ))}
                        </div>
                        <Button onClick={() => setShowPopup(true)}>
                            + New Group
                        </Button>
                    </div>
                </PageSection>
                <PageSection className="w-full" titleBar={<>Join Groups</>}>
                    Hello
                </PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Groups;
