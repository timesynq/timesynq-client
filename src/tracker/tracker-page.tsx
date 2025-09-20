import { useAuth } from "@/contexts/auth-provider";
import { useEffect } from "react";

export const Tracker = () => {

    const { user, fetchUser } = useAuth();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 flex flex-col items-center justify-center m-4">
                {user?.userName}
                <p>Tracker</p>
            </main>
        </div>
    );

}