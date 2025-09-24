import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfilePicture } from "@/components/profile-picture";
import { UserSearchResults, UserService } from "@/api/users/user";
import { Toasts } from "@/utils/toasts";
import SearchIcon from "@/assets/svg/search-icon.svg?react";
import SettingsIcon from "@/assets/svg/settings-icon.svg?react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Explore = () => {

    const isMobile = useIsMobile();
    const [userQuery, setUserQuery] = useState<string>("");
    const [userSearchResults, setUserSearchResults] = useState<UserSearchResults | null>();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const onError = (description: string) => {Toasts.error(description)};

        if (userQuery.trim().length < 3) {
            onError("Please enter at least 3 letters.");
            return;
        }

        const users = await UserService.search(userQuery, onError);
        setUserSearchResults(users);
    };

    return (
        <main className="flex flex-col items-center justify-center m-4">
            <form onSubmit={handleSubmit} className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row space-x-2 m-2`}>
                <Input
                    className="w-full"
                    placeholder="Search..."
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                />
                <Button type="submit" variant="positive" size="icon" className="cursor-pointer w-12">
                    <SearchIcon  />
                </Button>
                <Button type="button" variant="negative" size="icon" className="cursor-pointer w-12">
                    <SettingsIcon />
                </Button>
            </form>
            <ul className={`${isMobile ? 'w-full' : 'min-w-[600px]'} mt-4 space-y-2 flex flex-col items-center justify-center`}>
                {userSearchResults && userSearchResults.items.length > 0 ? (
                    userSearchResults.items.map((i) => (
                        <li key={i.user.id} className={`${isMobile ? 'w-full' : 'min-w-[700px] flex-1'}`}>
                            <Link
                                to={`/profile/${i.user.id}`}
                                className="block bg-popover p-4 shadow-md hover:shadow-lg hover:bg-accent transition-all duration-200 border-border border-1"
                            >
                                <div className="flex items-center gap-4">
                                    <ProfilePicture data={i.user.profilePicture} size={12} />

                                    <div className="flex flex-col">
                                        <span className="text-lg font-semibold text-foreground">
                                            {i.user.userName}
                                        </span>

                                        <div className="flex gap-6 text-sm text-muted-foreground mt-1">
                                            <span>
                                                <span className="font-medium text-foreground">
                                                    {i.user.followerCount}
                                                </span>{" "}
                                                Followers
                                            </span>
                                            <span>
                                                <span className="font-medium text-foreground">
                                                    {i.user.followeeCount}
                                                </span>{" "}
                                                Following
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))
                ) : (
                    !error && <p className="text-muted-foreground">No users found.</p>
                )}
            </ul>
        </main>
    );
};

