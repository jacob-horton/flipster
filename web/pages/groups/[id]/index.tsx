import PageSection from "@components/PageSection";
import ProtectedRoute from "@components/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/router";

const Groups = () => {
    const router = useRouter();

    let groupId = undefined;
    if (typeof router.query.id === "string") {
        groupId = parseInt(router.query.id);
    }

    return (
        <ProtectedRoute>
            <div className="flex h-full flex-row space-x-4 p-4">
                <PageSection
                    className="w-full justify-between"
                    titleBar={<>Details for group with ID: {groupId}</>}
                >
                    <Link
                        className="rounded-lg bg-gray-200 px-4 py-2"
                        href={`/groups/${groupId}/files`}
                    >
                        Files
                    </Link>
                </PageSection>
            </div>
        </ProtectedRoute>
    );
};

export default Groups;
