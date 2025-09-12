import { User } from "@/types/usertypes";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import logo from '/logo/timesynq-logo-placeholder.png'
import { useIsMobile } from "@/hooks/use-mobile";
import HomeIcon from "@/assets/svg/home-icon.svg?react";
import PlusIcon from "@/assets/svg/plus-icon.svg?react";
import SearchIcon from "@/assets/svg/search-icon.svg?react";
import { ProfileDropdown } from "./profile-dropdown";
import { Link } from "react-router-dom";
import { SignInDialog } from "./sign-in-dialog";
import { RegisterDialog } from "./register-dialog";

interface NavBarProps {
    user?: User
} 

export function NavBar({ user }: NavBarProps) {

    const isMobile: boolean = useIsMobile();

    return (
        <>
            <div className="fixed top-0 w-full z-50 shadow-md bg-card border-b border-border h-16">
                <div className="flex items-center justify-between h-full px-4">
                    <Link to="/">
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-10 w-auto max-w-[120px] object-contain"
                        />
                    </Link>

                    {!isMobile && 
                        <div className="flex-1 text-center">
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
                                        link: "/user-search"
                                    }].map((option) => (
                                        <Link to={option.link} key={option.link}>
                                            <NavigationMenuItem key={option.label}>
                                                <NavigationMenuLink asChild>
                                                    <Button variant="link" className="text-foreground cursor-pointer text-sm sm:text-base">
                                                        {option.label}
                                                    </Button>
                                                </NavigationMenuLink>
                                            </NavigationMenuItem>
                                        </Link>
                                    ))}
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    }

                    {user ? (
                        <ProfileDropdown user={user} />
                    ) : (
                        <div className="flex space-x-2">
                            <SignInDialog />
                            <RegisterDialog />
                        </div>
                    )}
                </div>
            </div>

            {isMobile && (
                <div className="fixed bottom-0 w-full z-50 shadow-md bg-card border-t border-border h-20">
                    <div className="flex items-center justify-around px-4 pt-2 pb-6">
                        {[
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
                                link: "/user-search"
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
                        ))}
                    </div>
                </div>
            )}
            <div className="h-20" />
        </>
    );
}
