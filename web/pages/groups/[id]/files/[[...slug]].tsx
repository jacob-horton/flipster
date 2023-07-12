import Button from "@components/Button";
import PageSection from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import { getRequest, postRequest } from "@src/apiRequest";
import { UserGroup } from "@src/types/UserGroup";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useAuth } from "react-oidc-context";

const Groups = () => {
    const auth = useAuth();
    const router = useRouter();

    let groupId = undefined;
    if (typeof router.query.id === "string") {
        groupId = parseInt(router.query.id);
    }

    console.log(router.query.slug);

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
            <div className="p-4 h-full flex flex-row space-x-4">
                <PageSection
                    className="w-full justify-between"
                    titleBar={<>Files for group with ID: {groupId}</>}
                >
                    Path: {router.query.slug?.join("/")}
                </PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Groups;
