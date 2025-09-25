import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfilePicture } from "@/components/profile-picture";
import { User, UserService } from "@/api/users/user";
import { Toasts } from "@/utils/toasts";
import SearchIcon from "@/assets/svg/search-icon.svg?react";
import SettingsIcon from "@/assets/svg/settings-icon.svg?react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { PagedList } from "@/api/paged-list";

export const Explore = () => {

    const isMobile = useIsMobile();
    const [userQuery, setUserQuery] = useState<string>("");
    const [searchResultMessage, setSearchResultMessage] = useState<string>("");
    const [userSearchHypermediaResource, setUserSearchHypermediaResource] = useState<PagedList<User> | null>();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const onError = (description: string) => {Toasts.error(description)};

        if (userQuery.trim().length < 3) {
            onError("Please enter at least 3 letters.");
            return;
        }

        const pagedUsers = await UserService.search(userQuery, onError);
        setUserSearchHypermediaResource(pagedUsers);
        setSearchResultMessage(`User search results for "${userQuery}"`);
    };

    return (
        <main className="flex flex-col items-center justify-center m-4">
            <form onSubmit={handleSubmit} className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row space-x-2 m-2 pb-4`}>
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
            <div className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row items-end justify-between space-x-8`}>
                <p className="w-[50%] text-sm">{searchResultMessage}</p>
                <Pagination className="w-[50%] justify-end">
                    <PaginationContent className="space-x-2">
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <p>Page 1 of 3</p>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
            <ul className={`${isMobile ? 'w-full' : 'min-w-[600px]'} mt-4 space-y-2 flex flex-col items-center justify-center`}>
                {userSearchHypermediaResource && userSearchHypermediaResource.items().length > 0 ? (
                    userSearchHypermediaResource.items().map((entry) => (
                        <li key={entry.id} className={`${isMobile ? 'w-full' : 'min-w-[700px] flex-1'}`}>
                            <Link
                                to={`/profile/${entry.id}`}
                                className="block bg-popover p-4 shadow-md hover:shadow-lg hover:bg-accent transition-all duration-200 border-border border-1"
                            >
                                <div className="flex items-center gap-4">
                                    <ProfilePicture data={entry.profilePicture} size={8} />

                                    <div className="flex flex-col">
                                        <span className="text-lg font-semibold text-foreground">
                                            {entry.userName}
                                        </span>

                                        <div className="flex gap-6 text-sm text-muted-foreground mt-1">
                                            <span>
                                                <span className="font-medium text-foreground">
                                                    {entry.followerCount}
                                                </span>{" "}
                                                Followers
                                            </span>
                                            <span>
                                                <span className="font-medium text-foreground">
                                                    {entry.followeeCount}
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

