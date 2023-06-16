import { useAuth } from "react-oidc-context";
import { CgProfile } from "react-icons/cg";

const Login = () => {
  const auth = useAuth();

  return (
    <button
      className="flex space-x-2 items-center"
      onClick={() =>
        auth.isAuthenticated ? auth.signoutSilent() : auth.signinRedirect()
      }
    >
      {/* TODO: profile icon */}
      <CgProfile />
      <p>
        {auth.isAuthenticated
          ? `${auth.user?.profile.preferred_username} (Logout)`
          : "Login"}
      </p>
    </button>
  );
};

export default Login;
