import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ProfilePicture } from "./profile-picture";
import { Link } from "react-router-dom";
import { User } from "@/api/users/user";
import { logout } from "@/api/auth/logout";

interface ProfileDropdownProps {
    user: User
} 

export const ProfileDropdown = ({ user }: ProfileDropdownProps) => {

    const handleLogout = async (): Promise<void> => {
        const result = await logout();
        if (result) {
            console.error("Logout failed:", result);
            return;
        }
        window.location.reload();
    }

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
                <DropdownMenuItem onClick={handleLogout}>
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}