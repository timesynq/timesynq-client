import { NavBar } from "@/components/nav-bar";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const Create = () => {
    const { user, isLoading, fetchUser } = useAuthStore();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (!user && !isLoading) {
        return <Navigate to="/" state={{ open: "signin" }} replace />;
    }

    return (
        <>
            <NavBar />
            <main className="flex flex-col items-center justify-center">
                {isLoading ? (
                    <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                ) : (
                    <p>Create</p>
                )}
            </main>
        </>
    );
};

export default Create