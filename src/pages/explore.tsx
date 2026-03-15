import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfilePicture } from "@/components/profile-picture";
import { UserSortField } from "@/api/users/user";
import { Toasts } from "@/utils/toasts";
import SearchIcon from "@/assets/svg/search-icon.svg?react";
import SettingsIcon from "@/assets/svg/settings-icon.svg?react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Page } from "@/api/paged-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUserSearch } from "@/hooks/use-user-search";
import { Result } from "@/api/result";

export const Explore = () => {

    const isMobile = useIsMobile();
    const [userQuery, setUserQuery] = useState<string>("");
    const [searchResultMessage, setSearchResultMessage] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const {
        // read only values
        items,
        pageNumber,
        pageSize,
        totalPages,
        sortReverse,
        sortBy,
        isLoading,

        // api functions
        queryByPage,
        updatePageSize,
        updateSortOrder,
        updateSortBy,
        trySearch,
        tryGoTo
    } = useUserSearch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const searchResult: Result<void> = await trySearch(userQuery);
        if (searchResult.isSuccessful)
            setSearchResultMessage(`User search results for "${userQuery}"`);
        else
            Toasts.error(searchResult.message);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    }

    const handleUpdateSortOrder = async (newSortReverse: boolean) => {
        const updateSortOrderResult: Result<void> = await updateSortOrder(newSortReverse);
        if (!updateSortOrderResult.isSuccessful)
            Toasts.error(updateSortOrderResult.message); 
    }

    const handleUpdateSortBy = async (newSortBy: string) => {
        await updateSortBy(newSortBy);
    }

    const handlePageSizeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        const input = Number(e.target.value);
        if (isNaN(input))
            return;

        const updatePageSizeResult: Result<void> = await updatePageSize(input);
        if (!updatePageSizeResult.isSuccessful)
            Toasts.error(updatePageSizeResult.message);
    }

    const handlePageQuery = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const input: string = formData.get("page-number") as string;
        const newPageNumber = parseInt(input);
        
        if (isNaN(newPageNumber))
            return;

        const queryByPageResult: Result<void> = await queryByPage(newPageNumber);
        if (!queryByPageResult.isSuccessful)
            Toasts.error(queryByPageResult.message);

        setIsOpen(false);
    }

    const handleTryGoTo = async (page: Page) => {
        await tryGoTo(page);
    }

    return (
        <main className="flex flex-col items-center justify-center m-4">
            <Tabs defaultValue="tracks">
                <TabsList className="my-2">
                    <TabsTrigger value="tracks">Tracks</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
                <TabsContent value="tracks">
                    <p className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row space-x-2 pb-4`}>Not implemented yet.</p>
                </TabsContent>
                <TabsContent value="users">
                    <form onSubmit={handleSubmit} className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row items-center space-x-2 pb-4`}>
                        <Input
                            className="w-full"
                            placeholder="Search..."
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                        />
                        <Button type="submit" variant="positive" size="icon" className="cursor-pointer w-12">
                            <SearchIcon />
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
                                        onCheckedChange={() => handleUpdateSortOrder(!sortReverse)}
                                    >
                                        Reverse sort
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => handleUpdateSortBy(value)}>
                                            <DropdownMenuRadioItem value={UserSortField.username} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                Sort by username
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value={UserSortField.followers} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                Sort by followers
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value={UserSortField.accountAge} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                Sort by account age
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                    </form>
                    <div className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row items-end justify-between space-x-8 h-10`}>
                        <p className="w-[50%] text-sm ">{searchResultMessage}</p>
                        { totalPages > 0 && 
                            <Pagination className="w-[50%] justify-end">
                                <PaginationContent className="space-x-2">
                                    <PaginationItem>
                                        <PaginationPrevious onClick={() => handleTryGoTo(Page.Previous)} className={`${pageNumber == 1 ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <p>Page {pageNumber} of {totalPages}</p>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext onClick={() => handleTryGoTo(Page.Next)} className={`${pageNumber == totalPages ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`}/>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        }
                    </div>
                    <ul className={`${isMobile ? 'w-full' : 'min-w-[600px]'} mt-4 space-y-2 flex flex-col items-center justify-center`}>
                        { items.length > 0 ? (
                            items.map((entry) => (
                                <li key={entry.id} className={`${isMobile ? 'w-full' : 'min-w-[700px] flex-1'}`}>
                                    <Link
                                        to={`/profile/${entry.id}`}
                                        target="_blank"
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
                            items.length == 0 && <p className="text-muted-foreground">No users found.</p>
                        )}
                    </ul>
                    { items.length > 0 &&
                        <div className="flex flex-row items-center justify-between space-x-2 my-4">
                            <Button variant="outline" onClick={() => handleTryGoTo(Page.First)} className={`${pageNumber == 1 ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`}>First</Button>
                            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="cursor-pointer">
                                        ...
                                    </Button>
                                </DialogTrigger>
                                    <DialogContent className="w-64">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Go to Page
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handlePageQuery} className="flex flex-col space-y-4">
                                            <Input
                                                name="page-number"
                                                type="number" 
                                                onChange={() => {}}
                                                onSelect={(e) => e.stopPropagation()}
                                                onClick={(e) => e.preventDefault()} 
                                                defaultValue={pageNumber}
                                            />
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button type="button" variant="outline" className="cursor-pointer">Close</Button>
                                                </DialogClose>
                                                <Button type="submit" variant="positive" className="cursor-pointer">Go</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                            </Dialog>
                            <Button 
                                variant="outline" 
                                onClick={() => handleTryGoTo(Page.Last)}
                                className={`${pageNumber == totalPages ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`}
                            >
                                Last
                            </Button>
                        </div>
                    }
                    
                </TabsContent>
            </Tabs>
        </main>
    );
};

