//signup register OR profile if signed in

import { User } from "@/types/usertypes";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import logo from '/logo/timesynq-logo-placeholder.png'

interface NavBarProps {
    user?: User
} 

export function NavBar({ user }: NavBarProps) {
    return (
        <div className="fixed top-0 w-full z-50 shadow-md bg-card border-b border-border h-16">
            <div className="relative flex items-center justify-between h-full px-4">

                <img
                    src={logo}
                    alt="Logo"
                    className="h-10 w-auto max-w-[120px] object-contain sm:max-w-[150px]"
                />

                <NavigationMenu className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
                    <NavigationMenuList className="flex gap-2 sm:gap-4">
                        {["Home", "Create", "Explore", "About"].map((label) => (
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

                {user ? (
                    <img
                        src={logo}
                        alt="User"
                        className="h-10 w-auto max-w-[120px] object-contain sm:max-w-[150px]"
                    />
                ) : (
                    <div className="flex space-x-2">
                        <Button variant="signin">Sign in</Button>
                        <Button variant="register">Register</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

