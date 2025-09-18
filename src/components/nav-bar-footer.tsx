import { useIsMobile } from "@/hooks/use-mobile";
import HomeIcon from "@/assets/svg/home-icon.svg?react";
import PlusIcon from "@/assets/svg/plus-icon.svg?react";
import SearchIcon from "@/assets/svg/search-icon.svg?react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuthStore } from "@/hooks/use-auth-store";

export const NavBarFooter = () => {
    const { user } = useAuthStore();
    const isMobile: boolean = useIsMobile();

    return (
        <>
            <div className="h-20" />
            {isMobile && (
                <div className="fixed bottom-0 w-full z-50 shadow-md bg-card border-t border-border h-20">
                    <div className="flex items-center justify-around px-4 pt-2 pb-6">
                        {user ? (
                            [
                            {
                                icon: HomeIcon,
                                label: "Home",
                                link: "/"
                            }, 
                            {
                                icon: PlusIcon,
                                label: "Create",
                                link: "/create"
                            }, 
                            {
                                icon: SearchIcon,
                                label: "Explore",
                                link: "/explore"
                            }
                        ].map((option) => (
                            <Link to={option.link} key={option.link}>
                                <Button key={option.label} variant="ghost" size="icon" className="size-14">
                                    <div className="flex flex-col items-center">
                                        <option.icon className="text-foreground"/>
                                        <p className="text-foreground pt-1">{option.label}</p>
                                    </div>
                                </Button>
                            </Link>
                        ))) : <p className="flex pt-4 text-xl">Welcome to Timesynq!</p>}
                    </div>
                </div>
            )}
        </>
    );
}