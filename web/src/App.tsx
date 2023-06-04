import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

const App = () => {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {
      console.log("auth");
    }
  }, [auth.isAuthenticated]);

  return (
    <div>
      <h1 className="text-center text-2xl p-10">Flipster</h1>
      {!auth.isAuthenticated && (
        <button onClick={() => auth.signinRedirect()}>Login</button>
      )}
      {auth.isAuthenticated && (
        <button onClick={() => auth.removeUser()}>
          Logout ({auth.user?.profile.preferred_username})
        </button>
      )}
    </div>
  );
};

export default App;
