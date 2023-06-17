import React from "react";
import { useAuth } from "react-oidc-context";

import Header from "../src/components/Header";
import ProtectedRoute from "../src/components/ProtectedRoute";

import Recents from "../src/components/routeHome/Recents";
import SpacedRepetition from "../src/components/routeHome/SpacedRepetition";
import Groups from "../src/components/routeHome/Groups";
import Calendar from "../src/components/routeHome/Calendar";

const Home = () => {
  const auth = useAuth();

  return (
    <ProtectedRoute>
      <div className="w-full h-full flex grow flex-col p-4 space-y-4">
        <Header>
          Welcome back {auth.user?.profile.given_name ?? "Unknown"}!
        </Header>
        <div className="grid grid-cols-7 h-full w-full space-x-4">
          <Recents />
          <div className="grid grid-rows-2 col-span-4 space-y-4">
            <div className="grid grid-cols-2 span-4 space-x-4">
              <SpacedRepetition />
              <Groups />
            </div>
            <Calendar />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Home;
