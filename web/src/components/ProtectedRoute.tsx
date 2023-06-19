import { ReactNode } from "react";
import { useAuth } from "react-oidc-context";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const auth = useAuth();

    return auth.isAuthenticated ? (
        <div className="flex-grow overflow-auto">{children}</div>
    ) : (
        <div className="text-center pt-10">Please login to view this page</div>
    );
};

export default ProtectedRoute;
