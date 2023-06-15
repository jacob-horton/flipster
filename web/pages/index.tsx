import React from "react";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

export default function Index() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {
      console.log("auth");
    }
  }, [auth.isAuthenticated]);

  return (
    <div className="p-2">
      <h1 className="text-center text-2xl p-10">Flipster</h1>
      {!auth.isAuthenticated && (
        <button
          className="bg-gray-300 rounded-lg px-4 py-1 border-opacity-50 border-gray-400 border"
          onClick={() => auth.signinRedirect()}
        >
          Login
        </button>
      )}
      {auth.isAuthenticated && (
        <button onClick={() => auth.signoutSilent()}>
          Logout ({auth.user?.profile.preferred_username})
        </button>
      )}
    </div>
  );
}
