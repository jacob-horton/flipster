import React from "react";
import { AuthProvider } from "react-oidc-context";
import keycloak from "@src/keycloak";
import "./globals.css";
import Navbar from "@components/navbar/Navbar";

const App = ({ Component, pageProps }) => {
    return (
        <AuthProvider
            {...keycloak}
            onSigninCallback={() => {
                console.log("Signed in");
            }}
        >
            <div className="flex flex-col h-screen">
                <Navbar />
                <Component {...pageProps} />
            </div>
        </AuthProvider>
    );
};

export default App;
