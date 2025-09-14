import { NavBar } from "@/components/nav-bar";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";


const UserSearch = () => {

    const { user, fetchUser } = useAuthStore();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
    <>
        {user ? (
        <>
            <NavBar />
            <main className="flex flex-col items-center justify-center">
            {user.userName}
            </main>
        </>
        ) : (
            <Navigate to="/" state={{ open: "signin" }} replace />
        )}
    </>
    );
}

export default UserSearch