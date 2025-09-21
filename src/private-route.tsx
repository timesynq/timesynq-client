import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/auth-provider";
import LoadingSpinner from "@/assets/svg/loading-spinner.svg?react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children } : PrivateRouteProps) => {
    const { user, isLoading } = useAuth();

    if(isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <main className="flex-1 flex flex-col items-center justify-center m-4">
                    <LoadingSpinner className="w-8 text-foreground"/>
                </main>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" state={{ open: "signin" }} replace />;
    }

    return <>{children}</>;
}