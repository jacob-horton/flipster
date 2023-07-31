import { getRequest } from "@src/apiRequest";
import { UserGroup } from "@src/types/UserGroup";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import PageSection from "../PageSection";
import { MdGroups } from "react-icons/md";
import Link from "next/link";
import { BsFolder } from "react-icons/bs";

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
        <PageSection
            className="col-span-2 h-full"
            titleBar="Groups"
            icon={<MdGroups size={28} className="space-x-4 space-y-4" />}
            bgIcon={<MdGroups size={200} />}
        >
            <div className="space-y-2 h-60 overflow-auto">
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
        </PageSection>
    );
};

export default Groups;
