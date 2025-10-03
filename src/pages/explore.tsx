import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Explore = () => {

    const isMobile = useIsMobile();
    const [userQuery, setUserQuery] = useState<string>("");
    const [pageSize, setPageSize] = useState<number>(10);
    const [sortReverse, setSortReverse] = useState<boolean>(false);
    const [userSortBy, setUserSortBy] = useState<string>("username");
    const [searchResultMessage, setSearchResultMessage] = useState<string>("");
    const [userSearchHypermediaResource, setUserSearchHypermediaResource] = useState<PagedList<User> | null>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const onError = (description: string) => {Toasts.error(description)};

        if (userQuery.trim().length < 3) {
            e && onError("Please enter at least 3 letters.");
            return;
        }

        const sortOrder: string = sortReverse ? "reverse" : "default";

        const pagedUsers = await UserService.search(userQuery, 1, pageSize, sortOrder, userSortBy, onError);
        setUserSearchHypermediaResource(pagedUsers);
        setSearchResultMessage(`User search results for "${userQuery}"`);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        const input: string = e.target.value;
        const oldPageSize = pageSize;
        const newPageSize = parseInt(input);

        const clamp = (num: number, min: number, max: number): number => {  
            return num < min ? min : num > max ? max : num; 
        }

        setPageSize(isNaN(newPageSize) ? oldPageSize : clamp(newPageSize, 1, 100));
    }

    const pageNumber = userSearchHypermediaResource?.pageNumber();
    const totalPages = userSearchHypermediaResource? userSearchHypermediaResource.totalPages() : 0;

    const handleGetPreviousPage = async () => {
        if(!userSearchHypermediaResource || userSearchHypermediaResource.pageNumber() == 1)
            return;
        const previousPageResource = await userSearchHypermediaResource.getPreviousPage();
        if(previousPageResource != null){
            setUserSearchHypermediaResource(previousPageResource);
        }
    }

    const handleGetNextPage = async () => {
        if(!userSearchHypermediaResource || userSearchHypermediaResource.pageNumber() == userSearchHypermediaResource.totalPages())
            return;
        const nextPageResource = await userSearchHypermediaResource.getNextPage();
        if(nextPageResource != null){
            setUserSearchHypermediaResource(nextPageResource);
        }
    }

    return (
        <main className="flex flex-col items-center justify-center m-4">
            <Tabs defaultValue="tracks">
                <TabsList className="m-2">
                    <TabsTrigger value="tracks">Tracks</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
                <TabsContent value="tracks">
                    <p className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row space-x-2 m-2 pb-4`}>Not implemented yet.</p>
                </TabsContent>
                <TabsContent value="users">
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" variant="negative" size="icon" className="cursor-pointer w-12">
                                        <SettingsIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-row items-center justify-between space-x-8">
                                            <p className="w-[80%]">Page size</p>
                                            <Input
                                                type="number" 
                                                onChange={(e) => handlePageSizeChange(e)}
                                                onSelect={(e) => e.stopPropagation()}
                                                onClick={(e) => e.preventDefault()} 
                                                defaultValue={pageSize}
                                            />
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem
                                        className="cursor-pointer"
                                        checked={sortReverse} 
                                        onSelect={(e) => e.preventDefault()} 
                                        onClick={(e) => e.stopPropagation()} 
                                        onCheckedChange={setSortReverse}
                                    >
                                        Reverse sort
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={userSortBy} onValueChange={setUserSortBy}>
                                            <DropdownMenuRadioItem value="username" onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                Sort by username
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="followers" onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                Sort by followers
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="accountAge" onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                Sort by account age
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                    </form>
                    <div className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row items-end justify-between space-x-8`}>
                        <p className="w-[50%] text-sm">{searchResultMessage}</p>
                        {!!totalPages && totalPages > 0 && 
                            <Pagination className="w-[50%] justify-end">
                                <PaginationContent className="space-x-2">
                                    <PaginationItem>
                                        <PaginationPrevious onClick={handleGetPreviousPage} className={`${pageNumber == 1 ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <p>Page {pageNumber} of {totalPages}</p>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext onClick={handleGetNextPage} className={`${pageNumber == totalPages ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`}/>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        }
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
                            userSearchHypermediaResource && userSearchHypermediaResource.items().length == 0 && <p className="text-muted-foreground">No users found.</p>
                        )}
                    </ul>
                </TabsContent>
            </Tabs>
        </main>
    );
};

