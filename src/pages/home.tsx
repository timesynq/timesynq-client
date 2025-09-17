import { NavBar } from "@/components/nav-bar";
import { NavBarFooter } from "@/components/nav-bar-footer";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

export const Home = () => {

    const { user, fetchUser } = useAuthStore();
    const isMobile: boolean = useIsMobile();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-1 flex flex-col items-center justify-center m-4">
                {user?.userName}
            </main>
            {isMobile &&
                <NavBarFooter />
            }
        </div>
    );

}