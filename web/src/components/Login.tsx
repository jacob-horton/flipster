import { useAuth } from "react-oidc-context";

const Login = () => {
    const auth = useAuth();

    return <button
        className="flex space-x-4 items-center"
        onClick={() => auth.isAuthenticated ? auth.signinRedirect() : auth.signoutSilent()}
    >
        {/* TODO: profile icon */}
        <div className="w-6 h-6 bg-gray-500" />
        <p>{auth.isAuthenticated ? `${auth.user?.profile.preferred_username} (Logout)` : "Login"}</p>
    </button>
}

export default Login;