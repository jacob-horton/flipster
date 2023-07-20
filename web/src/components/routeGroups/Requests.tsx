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
    return requests.map((req) => (
        <button
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
            {req.firstName}
        </button>
    ));
}
