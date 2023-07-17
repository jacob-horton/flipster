import { ReactNode } from "react";
import { useAuth } from "react-oidc-context";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const auth = useAuth();

    return auth.isAuthenticated ? (
        <>{children}</>
    ) : (
        <div className="pt-10 text-center">Please login to view this page</div>
    );
};

export default ProtectedRoute;
