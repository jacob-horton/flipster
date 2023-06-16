import React from "react";
import { AuthProvider } from "react-oidc-context";
import keycloak from "../src/keycloak";
import { User } from "oidc-client-ts";
import getPublicURL from "../src/getPublicURL";
import "./globals.css";
import Navbar from "../src/components/Navbar"

export default function App({ Component, pageProps }) {
  return (
    <React.StrictMode>
      <AuthProvider
        {...keycloak}
        redirect_uri={getPublicURL("")}
        onSigninCallback={async (a) => {
          // TODO: remove, but keep function (documentation says it needs to be defined for auto refresh or smth)
          if (a instanceof User) {
            console.log(a.id_token);
            console.log(`${process.env.NEXT_PUBLIC_API_URL}/test`);
            const result = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/test`,
              {
                method: "GET",
                headers: {
                  Authorization: "Bearer " + a.id_token,
                  "Content-Type": "application/json",
                },
              }
            );
            console.log(result.status);
            console.log(result.body);
          }
        }}
      >
        <div className="flex flex-col h-screen bg-gray-100">
            <Navbar/>
            <Component {...pageProps} />
        </div>
      </AuthProvider>
    </React.StrictMode>
  );
}
