import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import keycloak from "./keycloak.ts";
import { AuthProvider } from "react-oidc-context";
import { User } from "oidc-client-ts";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider
      {...keycloak}
      redirect_uri={window.location.origin}
      onSigninCallback={async (a) => {
        // TODO: remove, but keep function (documentation says it needs to be defined for auto refresh or smth)
        if (a instanceof User) {
          console.log(a.id_token);
          console.log(`${import.meta.env.VITE_API_URL}/test`);
          const result = await fetch(`${import.meta.env.VITE_API_URL}/test`, {
            method: "GET",
            headers: {
              Authorization: "Bearer " + a.id_token,
              "Content-Type": "application/json",
            },
          });
          console.log(result.status);
          console.log(result.body);
        }
      }}
    >
      <App />
    </AuthProvider>
  </React.StrictMode>
);
