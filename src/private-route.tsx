import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/auth-provider"

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children } : PrivateRouteProps) => {
    const { user, isLoading } = useAuth();

    if(isLoading) {
        return <div></div>
    }

    if (!user) {
        return <Navigate to="/" state={{ open: "signin" }} replace />;
    }

    return <>{children}</>;
}