import { User } from "@/types/usertypes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ProfilePicture } from "./profile-picture";
import { Link } from "react-router-dom";
import { Logout } from "@/api/auth/logout";

interface ProfileDropdownProps {
    user: User
} 

export function ProfileDropdown({ user }: ProfileDropdownProps) {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="h-12 px-4 flex items-center justify-between"
                >
                    <div className="flex items-center w-full gap-3">
                        <div className="w-8 overflow-hidden flex-shrink-0">
                            <ProfilePicture data={user.profilePicture} size={6}/>
                        </div>
                        {user.userName}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <Link to={`/profile/${user.id}`}>
                    <DropdownMenuItem>
                            Profile
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={Logout.handler}>
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}