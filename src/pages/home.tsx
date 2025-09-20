import { NavBar } from "@/components/nav-bar";
import { NavBarFooter } from "@/components/nav-bar-footer";
import { useAuth } from "@/contexts/auth-provider";
import { useIsMobile } from "@/hooks/use-mobile";

export const Home = () => {

    const { user } = useAuth();
    const isMobile: boolean = useIsMobile();

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