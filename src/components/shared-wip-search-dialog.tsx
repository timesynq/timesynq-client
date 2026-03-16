import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import SearchIcon from "@/assets/svg/search-icon.svg?react";
import SettingsIcon from "@/assets/svg/settings-icon.svg?react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { Page } from "@/api/paged-list";
import { Toasts } from "@/utils/toasts";
import { SharedWip, WipService, WipShareSortField } from "@/api/wips/wip";
import TrashIcon from "@/assets/svg/trash-icon.svg?react";
import LoadingIndicator from "@/assets/svg/loading-indicator.svg?react";
import { Link, useNavigate } from "react-router-dom";
import { Result } from "@/api/result";
import { useSharedWipSearch } from "@/hooks/use-shared-wip-search";
import { useAuth } from "@/contexts/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import PlusIcon from "@/assets/svg/plus-icon.svg?react";

interface AcceptDialogState {
    open: boolean,
    sharedWip?: SharedWip
}

interface DeleteDialogState {
    open: boolean,
    sharedWip?: SharedWip
}

export const SharedWipSearchDialog = () => {

    const isMobile = useIsMobile();

    const accepted = useSharedWipSearch(true);
    const unaccepted = useSharedWipSearch(false);

    const [acceptedQuery, setAcceptedQuery] = useState<string>("");
    const [unacceptedQuery, setUnacceptedQuery] = useState<string>("");

    useEffect(() => {
        accepted.trySearch(acceptedQuery);
        unaccepted.trySearch(unacceptedQuery);
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full" variant="outline">Select Song</Button>
            </DialogTrigger>
            <DialogContent className={`${isMobile ? 'w-full' : 'min-w-[750px]'} h-[770px] flex flex-col`}>
                <Tabs>
                    <TabsList className="mb-2">
                        <TabsTrigger value="accepted">Accepted Invites</TabsTrigger>
                        <TabsTrigger value="unaccepted">Incoming Invites</TabsTrigger>
                    </TabsList>

                    <TabsContent value="accepted">
                        <PaginatedDialogContent 
                            isAccepted
                            query={acceptedQuery}
                            setQuery={setAcceptedQuery}
                            search={accepted}
                        />
                    </TabsContent>
                    <TabsContent value="unaccepted">
                        <PaginatedDialogContent
                            isAccepted={false}
                            query={unacceptedQuery}
                            setQuery={setUnacceptedQuery}
                            search={unaccepted}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

interface SharedWipDialogContentProps {
    isAccepted: boolean,
    query: string,
    setQuery: (q: string) => void,
    search: ReturnType<typeof useSharedWipSearch>
}

const PaginatedDialogContent = ({isAccepted, query, setQuery, search}: SharedWipDialogContentProps) => {

    const { user } = useAuth(); 
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    const [searchResultMessage, setSearchResultMessage] = useState<string>("All results");
    const [isPageQueryOpen, setIsPageQueryOpen] = useState<boolean>(false);
    const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>({open: false});
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
    const [acceptDialogState, setAcceptDialogState] = useState<AcceptDialogState>({open: false});
    const [isAcceptLoading, setIsAcceptLoading] = useState<boolean>(false);

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
    } = search;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const searchResult: Result<void> = await trySearch(query);
        if(searchResult.isSuccessful){
            if(query.length > 0)
                setSearchResultMessage(`Search results for "${query}"`);
            else
                setSearchResultMessage("All results");
        }
        else
            Toasts.error(searchResult.message);
    }

    const handlePageQueryOpenChange = (open: boolean) => {
        setIsPageQueryOpen(open);
    }

    const closeAcceptDialog = () => {
        setAcceptDialogState(prev => ({...prev, open: false}));
    }

    const closeDeleteDialog = () => {
        setDeleteDialogState(prev => ({...prev, open: false}));
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

    const handleUpdateSortOrder = async (newSortReverse: boolean) => {
        const updateSortOrderResult: Result<void> = await updateSortOrder(newSortReverse);
        if (!updateSortOrderResult.isSuccessful)
            Toasts.error(updateSortOrderResult.message); 
    }

    const handleUpdateSortBy = async (newSortBy: string) => {
        await updateSortBy(newSortBy);
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

        setIsPageQueryOpen(false);
    }

    const handleAcceptShare = async (wipId: string | null | undefined) => {
        if(wipId === null || wipId === undefined)
            return;
        
        setIsAcceptLoading(true);

        const acceptResult: Result<void> = await WipService.acceptShare(wipId);
        if(acceptResult.isSuccessful){
            Toasts.success("Invite accepted.");
            await trySearch(query);
            closeAcceptDialog();
        }
        else{
            Toasts.error(acceptResult.message);
        }
        setIsAcceptLoading(false);
    }

    const handleDelete = async (wipId: string | null | undefined) => {
        if(wipId === null || wipId === undefined || user === null)
            return;
        
        setIsDeleteLoading(true);

        const deleteResult: Result<void> = await WipService.unshareOne(wipId, user?.id);
        if(deleteResult.isSuccessful){
            Toasts.success(isAccepted ? "Wip deleted." : "Invite deleted.");
            await trySearch(query);
            closeDeleteDialog();
        }
        else{
            Toasts.error(deleteResult.message);
        }
        setIsDeleteLoading(false);
    }

    const handleTryGoTo = async (page: Page) => {
        await tryGoTo(page);
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="w-full flex flex-row items-center space-x-2 pb-4">
                <Input
                    className="w-full"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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
                        <DropdownMenuLabel asChild className="font-normal">
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
                                <DropdownMenuRadioItem value={WipShareSortField.name} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                    Sort by name
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value={WipShareSortField.shareAge} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                    Sort by most recently shared
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </form>
            <div className={`${isMobile ? 'w-full' : 'min-w-[700px]'} mb-4 flex flex-row items-end justify-between space-x-8 h-10`}>
                <p className="w-[50%] text-sm truncate whitespace-nowrap text-ellipsis">
                    {searchResultMessage}
                </p>
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
            <div className="h-[500px] overflow-y-auto -mx-4 px-4 no-scrollbar">
                <ul className={`${isMobile ? 'w-full' : 'min-w-[600px]'} mt-4 space-y-2 flex flex-col items-center justify-center`}>
                    { items.length > 0 ? (
                        items.map((entry) => (
                            <li key={entry.id} className={`${isMobile ? 'w-full' : 'min-w-[700px] flex-1'}`}>
                                <div 
                                    onDoubleClick={() => isAccepted && navigate(`/room/${entry.id}`)}
                                    className="block bg-popover p-4 shadow-md hover:shadow-lg hover:bg-accent transition-all duration-200 border-border border-1 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-row items-center w-full justify-between">
                                            <span className="flex flex-col justify-between">
                                                <span className="text-lg font-semibold text-foreground">{entry.name}</span>
                                                <span className="flex flex-row space-x-3 text-muted-foreground text-sm">
                                                    <span>by&nbsp;
                                                        <Link target="_blank" to={`/profile/${entry.ownerId}`} className="hover:underline">{entry.ownerName}</Link>
                                                    </span>
                                                    <span>Shared on {entry.lastOpenedOnUTC.toLocaleDateString()}</span>
                                                </span>
                                            </span>
                                            <div className="flex flex-row space-x-2">
                                                { !isAccepted &&
                                                    <Button 
                                                        variant="positive"
                                                        size="icon"
                                                        className="cursor-pointer"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setAcceptDialogState({
                                                                open: true,
                                                                sharedWip: entry
                                                            })
                                                        }}
                                                    >
                                                        <PlusIcon />
                                                    </Button>
                                                }
                                                <Button 
                                                    variant="negative"
                                                    size="icon"
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setDeleteDialogState({
                                                            open: true,
                                                            sharedWip: entry
                                                        })
                                                    }}
                                                >
                                                    <TrashIcon />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        items.length == 0 && <p className="text-muted-foreground">{isAccepted ? "No wips found." : "No invites found."}</p>
                    )}
                </ul>
            </div>
            { items.length > 0 &&
                <div className="flex flex-row items-center justify-between space-x-2 my-4">
                    <Button variant="outline" onClick={() => handleTryGoTo(Page.First)} className={`${pageNumber == 1 ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`}>First</Button>
                    <Dialog open={isPageQueryOpen} onOpenChange={handlePageQueryOpenChange}>
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
            <Dialog 
                open={acceptDialogState.open} 
                onOpenChange={(open) => {
                    if (!open)
                        closeAcceptDialog();
                }} 
            >
                <DialogContent className="max-w-[425px]">
                    <DialogHeader className="text-left">
                        <DialogTitle>
                            Accept invite to edit {acceptDialogState.sharedWip?.name}? 
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleAcceptShare(acceptDialogState.sharedWip?.id)} variant="positive" className="cursor-pointer w-20">
                                {isAcceptLoading ? <LoadingIndicator /> : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog 
                open={deleteDialogState.open} 
                onOpenChange={(open) => {
                    if (!open)
                        closeDeleteDialog();
                }} 
            >
                <DialogContent className="max-w-[425px]">
                    <DialogHeader className="text-left">
                        <DialogTitle>
                            Unshare {deleteDialogState.sharedWip?.name} with yourself? 
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleDelete(deleteDialogState.sharedWip?.id)} variant="negative" className="cursor-pointer w-20">
                                {isDeleteLoading ? <LoadingIndicator /> : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}