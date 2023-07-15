import { useAuth } from "react-oidc-context";
import { CgProfile } from "react-icons/cg";

const Login = () => {
    const auth = useAuth();

    return (
        <button
            className="flex items-center space-x-2"
            onClick={() =>
                auth.isAuthenticated
                    ? auth.signoutSilent()
                    : auth.signinRedirect()
            }
        >
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
