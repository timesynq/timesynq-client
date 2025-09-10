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


interface NavBarProps {
    user?: User
} 

export function NavBar({ user }: NavBarProps) {

    const isMobile: boolean = useIsMobile();

    return (
        <>
            <div className="fixed top-0 w-full z-50 shadow-md bg-card border-b border-border h-16">
                <div className="flex items-center justify-between h-full px-4">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-10 w-auto max-w-[120px] object-contain"
                    />

                    {!isMobile && 
                        <div className="flex-1 text-center">
                            <NavigationMenu className="inline-block">
                                <NavigationMenuList className="flex gap-2 sm:gap-4 justify-center">
                                    {["Home", "Create", "Explore"].map((label) => (
                                        <NavigationMenuItem key={label}>
                                            <NavigationMenuLink asChild>
                                                <Button variant="link" className="text-foreground cursor-pointer text-sm sm:text-base">
                                                    {label}
                                                </Button>
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>
                                    ))}
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    }

                    {user ? (
                        <img
                            src={logo}
                            alt="User"
                            className="h-10 w-auto max-w-[120px] object-contain sm:max-w-[150px]"
                        />
                    ) : (
                        <div className="flex space-x-2">
                            <Button variant="signin" className="cursor-pointer">Sign in</Button>
                            <Button variant="register" className="cursor-pointer">Register</Button>
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
                            }, 
                            {
                                icon: PlusIcon,
                                label: "Create",
                            }, 
                            {
                                icon: SearchIcon,
                                label: "Explore",
                            }
                        ].map((option) => (
                            <Button key={option.label} variant="ghost" size="icon">
                                <div className="flex flex-col items-center">
                                    <option.icon className="text-foreground"/>
                                    <p className="text-foreground">{option.label}</p>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
