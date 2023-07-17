import React from "react";
import { useAuth } from "react-oidc-context";

import Header from "@components/Header";
import ProtectedRoute from "@components/ProtectedRoute";

import Recents from "@components/routeHome/Recents";
import SpacedRepetition from "@components/routeHome/SpacedRepetition";
import Groups from "@components/routeHome/Groups";
import Calendar from "@components/routeHome/Calendar";

const Home = () => {
    const auth = useAuth();

    return (
        <ProtectedRoute>
            <div className="flex h-full flex-col space-y-4 p-4">
                <Header>
                    Welcome back {auth.user?.profile.given_name ?? "Unknown"}!
                </Header>
                <div className="grid grow grid-cols-7 grid-rows-2 gap-4">
                    <Recents />
                    <SpacedRepetition />
                    <Groups />
                    <Calendar />
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Home;
