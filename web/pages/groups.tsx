import PageSection from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { getRequest } from "@src/apiRequest";
import { UserGroup } from "@src/types/UserGroup";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";

const Groups = () => {
    const auth = useAuth();

    const { data: groups } = useQuery({
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
            <div className="p-4 h-full flex flex-row space-x-4">
                <PageSection className="w-full" titleBar={<>Your Groups</>}>
                    {groups.map((g) => (
                        <p key={g.id}>{g.name}</p>
                    ))}
                </PageSection>
                <PageSection className="w-full" titleBar={<>Join Groups</>}>
                    Hello
                </PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Groups;
