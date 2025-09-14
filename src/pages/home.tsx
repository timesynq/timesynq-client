import { NavBar } from "@/components/nav-bar";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useEffect } from "react";

export default function Home() {

    const { user, fetchUser } = useAuthStore();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <>
            <NavBar />
            <main className="flex flex-col items-center justify-center">
                {user && user.userName}
            </main>
        </>
    );
}