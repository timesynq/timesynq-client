import { User } from "@/types/usertypes";
import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ProfilePicture } from "./profile-picture";

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
                            <ProfilePicture data={user.profilePicture} />
                        </div>
                        {user.userName}
                    </div>
                </Button>
            </DropdownMenuTrigger>
        </DropdownMenu>
    );
}