import { useAuth } from "react-oidc-context";
import { useQuery } from "@tanstack/react-query";
import {
    reviewFidsKey,
    reviewModesKey,
    useSessionStorage,
} from "@src/useStorage";
import { getRequest } from "@src/apiRequest";
import ProtectedRoute from "@components/ProtectedRoute";
import Flip from "@components/routeReview/Flip";
import { NextFlashcardGetReq } from "@src/types/NextFlashcardGetReq";
import { NextFlashcardGetResp } from "@src/types/NextFlashcardGetResp";
import { FlashcardFromIDResp } from "@src/types/FlashcardFromIDResp";
import { FlashcardFromIDGet } from "@src/types/FlashcardFromIDGet";
import Button from "@components/Button";
/*
This page is accessed when the user has set modes and flashcards in localStorage. 
This page sends a request to /review/next to get the next 'packet' of
upcomingReview info. Then, it requests the flashcard info from ID via 
/flashcard/fromid and displays this.
The actual interfaces for the revision are in /src/components/routeReview
*/

export default function ReviewCards() {
    const auth = useAuth();
    const [reviewModes] = useSessionStorage(reviewModesKey, "");
    const [reviewFIDs] = useSessionStorage(reviewFidsKey, "");

    const { data: upcomingReviews } = useQuery({
        // gets the next packet of review modes and flashcards
        queryKey: ["upcomingReviews", reviewModes, reviewFIDs, auth.user],
        queryFn: async () => {
            if (!auth.user?.id_token) {
                return Promise.reject("Unauthorised");
            }
            const resp = await getRequest({
                path: "/review/next",
                id_token: auth.user.id_token,
                queryParams: {
                    modes: reviewModes,
                    flashcardIds: reviewFIDs,
                } as NextFlashcardGetReq,
            });
            if (resp.status != 200) {
                return Promise.reject(resp.body);
            } else {
                return (await resp.json()) as NextFlashcardGetResp;
            }
        },
        enabled: !!(reviewModes && reviewFIDs && auth.user?.id_token),
    });

    const { data: flashcard } = useQuery({
        // gets the flashcard info from id (SINGULAR)
        queryKey: ["get-flashcards", reviewFIDs],
        queryFn: async () => {
            if (!auth.user?.id_token) {
                return Promise.reject(
                    "tanstack react-query enabled bypassed: Unauthorised error"
                );
            }
            if (!upcomingReviews) {
                return Promise.reject(
                    "tanstack react-query enabled bypassed: No upcoming reviews"
                );
            }
            if (upcomingReviews.flashcardIds.split(",").length > 1) {
                return Promise.reject("MATCH not supported");
            }

            const resp = await getRequest({
                path: "/flashcard/fromid",
                id_token: auth.user.id_token,
                queryParams: {
                    flashcardId: parseInt(upcomingReviews.flashcardIds),
                } as FlashcardFromIDGet,
            });
            return (await resp.json()) as FlashcardFromIDResp;
        },
        enabled: !!(auth?.user && upcomingReviews),
    });

    if (!upcomingReviews || !flashcard) {
        return (
            <ProtectedRoute>{`Some error occurred. ${flashcard}`}</ProtectedRoute>
        );
    }

    switch (upcomingReviews.mode) {
        case "learn":
            return <h1>Unsupported mode.</h1>;
        case "match":
            return <h1>Unsupported mode.</h1>;
        case "flip":
            return (
                <div className="flex h-full w-full items-center justify-center">
                    <Button>Back</Button>
                    <Flip
                        term={flashcard.term}
                        definition={flashcard.definition}
                    ></Flip>
                    <Button>Forward</Button>
                </div>
            );
    }
}
