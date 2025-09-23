import { Button } from "./ui/button";
import { useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import logo from '/logo/timesynq-logo-placeholder.png'
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileDropdown } from "./profile-dropdown";
import { Link } from "react-router-dom";
import { SignInDialog } from "./sign-in-dialog";
import { RegisterDialog } from "./register-dialog";
import { useAuth } from "@/contexts/auth-provider";

export const NavBar = () => {

    const { user, isLoading } = useAuth();
    const isMobile: boolean = useIsMobile();
    const location = useLocation();
    window.history.replaceState({}, '');

    return (
        <>
            <div className="fixed top-0 w-full z-50 shadow-md bg-card border-b border-border h-16" style={{backgroundColor: "oklch(20.019% 0.04696 287.092)", borderBottom: "1px solid oklch(1 0 0 / 10%)"}}>
                <div className="flex items-center justify-between h-full px-4">
                    <Link to="/">
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-10 w-auto max-w-[120px] object-contain"
                        />
                    </Link>

                    {!isLoading && 
                        <>
                            {!isMobile && 
                                <div className="flex-1 text-center">
                                    {user ? (
                                        <NavigationMenu className="inline-block">
                                            <NavigationMenuList className="flex gap-2 sm:gap-4 justify-center">
                                                {[                            
                                                {
                                                    label: "Home",
                                                    link: "/"
                                                }, 
                                                {
                                                    label: "Create",
                                                    link: "/create"
                                                }, 
                                                {
                                                    label: "Explore",
                                                    link: "/explore"
                                                }].map((option) => (
                                                    <Link to={option.link} key={option.link}>
                                                        <NavigationMenuItem key={option.label}>
                                                            <NavigationMenuLink asChild>
                                                                <Button variant="link" className="text-foreground cursor-pointer text-sm sm:text-base w-20">
                                                                    {option.label}
                                                                </Button>
                                                            </NavigationMenuLink>
                                                        </NavigationMenuItem>
                                                    </Link>
                                                ))}
                                            </NavigationMenuList>
                                        </NavigationMenu>
                                    ) : <p className="text-xl pl-8">Welcome to Timesynq!</p>} 
                                </div>
                            }

                            {user ? (
                                <ProfileDropdown user={user} />
                            ) : (
                                <div className="flex space-x-2">
                                    <SignInDialog autoOpen={location.state?.open === "signin"} />
                                    <RegisterDialog />
                                </div>
                            )}
                        </>
                    }
                </div>
            </div>
            <div className="h-16" />
        </>
    );
}
