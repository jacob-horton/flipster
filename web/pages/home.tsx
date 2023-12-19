import React from "react";
import { useAuth } from "react-oidc-context";

const Home = () => {
    const auth = useAuth();

    return (
        <div className="flex h-full flex-col space-y-4 p-4">
            <h1>Welcome back {auth.user?.profile.given_name ?? "Unknown"}!</h1>
            <button
                className="w-32 rounded-md bg-gray-200 hover:bg-gray-300"
                onClick={() => auth.signinPopup()}
            >
                Sign in
            </button>
        </div>
    );
};

export default Home;
