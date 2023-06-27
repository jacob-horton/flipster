import React from "react";
import { AuthProvider } from "react-oidc-context";
import keycloak from "@src/keycloak";
import "./globals.css";
import Navbar from "@components/navbar/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProps } from "next/app";

const queryClient = new QueryClient();
const App = ({ Component, pageProps }: AppProps) => {
    return (
        <AuthProvider
            {...keycloak}
            onSigninCallback={() => {
                console.log("Signed in");
            }}
        >
            <QueryClientProvider client={queryClient}>
                <div className="flex flex-col h-screen bg-gray-100">
                    <Navbar />
                    <div className="grow overflow-auto">
                        <Component {...pageProps} />
                    </div>
                </div>
            </QueryClientProvider>
        </AuthProvider>
    );
};

export default App;
