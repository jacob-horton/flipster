import React from "react";
import { useAuth } from "react-oidc-context";
import Header from "../src/components/Header";
import PageSection from "../src/components/PageSection";

export default function Index() {
  const auth = useAuth();

  return (
    <div className="w-full h-full flex grow flex-col">
      <div className="flex flex-row justify-between">
        {auth.isAuthenticated && (
          <Header>Welcome back {auth.user?.profile.given_name}!</Header>
        )}
        {auth.isAuthenticated ? (
          <button
            className="bg-gray-300 rounded-lg px-4 py-1 border-opacity-50 border-gray-400 border"
            onClick={() => auth.signoutSilent()}
          >
            Logout ({auth.user?.profile.preferred_username})
          </button>
        ) : (
          <button
            className="bg-gray-300 rounded-lg px-4 py-1 border-opacity-50 border-gray-400 border"
            onClick={() => auth.signinRedirect()}
          >
            Login
          </button>
        )}
      </div>
      <div className="grid grid-cols-7 h-full w-full p-4 space-x-4">
        <PageSection className="col-span-3"></PageSection>
        <div className="grid grid-rows-2 col-span-4 space-y-4">
          <div className="grid grid-cols-2 span-4 space-x-4">
            <PageSection></PageSection>
            <PageSection></PageSection>
          </div>
          <PageSection></PageSection>
        </div>
      </div>
    </div>
  );
}
