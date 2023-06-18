import React from "react";
import { AuthProvider } from "react-oidc-context";
import keycloak from "../src/keycloak";
import "./globals.css";
import Navbar from "../src/components/navbar/Navbar";

const App = ({ Component, pageProps }) => {
  return (
    <React.StrictMode>
      <AuthProvider
        {...keycloak}
        onSigninCallback={() => {
          console.log("Signed in");
        }}
      >
        <div className="flex flex-col h-screen bg-gray-100">
          <Navbar />
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </React.StrictMode>
  );
};

export default App;
