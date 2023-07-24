import { postRequest } from "@src/apiRequest";
import { AcceptRequestPostReq } from "@src/types/AcceptRequestPostReq";
import { UserDetails } from "@src/types/UserDetails";

interface RequestsProps {
    requests: Array<UserDetails>;
    groupUuid: string;
    id_token: string;
    onAccept: () => void;
}

export default function Requests({
    requests,
    groupUuid,
    id_token,
    onAccept,
}: RequestsProps) {
    return (
        <>
            <div className="mt-2 flex items-center space-x-2">
                <strong>{"Requests "}</strong>
                <div className="flex rounded-full bg-purple-500 px-3 text-white">
                    <p>{requests.length}</p>
                </div>
            </div>

            <div className="space-y-2">
                {requests.map((req) => (
                    <div className="flex items-center justify-between">
                        <p>{req.firstName}</p>
                        <button
                            className="rounded-lg bg-purple-500 px-3 py-1 text-white"
                            key={req.id}
                            onClick={async () => {
                                const payload: AcceptRequestPostReq = {
                                    groupUuid,
                                    userId: req.id,
                                };

                                await postRequest({
                                    path: "/group/accept_request",
                                    payload: JSON.stringify(payload),
                                    id_token,
                                });

                                onAccept();
                            }}
                        >
                            Accept
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
