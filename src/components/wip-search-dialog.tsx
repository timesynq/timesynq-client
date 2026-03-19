import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import SearchIcon from "@/assets/svg/search-icon.svg?react";
import SettingsIcon from "@/assets/svg/settings-icon.svg?react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { useWipSearch } from "@/hooks/use-wip-search";
import { Page } from "@/api/paged-list";
import { Toasts } from "@/utils/toasts";
import { ChangeWipNameRequest, MAX_WIP_NAME_LENGTH, Wip, WipService, WipSortField } from "@/api/wips/wip";
import TrashIcon from "@/assets/svg/trash-icon.svg?react";
import LoadingIndicator from "@/assets/svg/loading-indicator.svg?react";
import { useNavigate } from "react-router-dom";
import { Result } from "@/api/result";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "./ui/context-menu";

interface UpdateWipDialogState {
    open: boolean,
    wip?: Wip
}

export const WipSearchDialog = () => {

    const isMobile = useIsMobile();
    const [nameQuery, setNameQuery] = useState<string>("");
    const [searchResultMessage, setSearchResultMessage] = useState<string>("All wips");
    const [isPageQueryOpen, setIsPageQueryOpen] = useState<boolean>(false);
    const [renameDialogState, setRenameDialogState] = useState<UpdateWipDialogState>({open: false});
    const [renameDialogInput, setRenameDialogInput] = useState<string>("");
    const [isRenameLoading, setIsRenameLoading] = useState<boolean>(false);
    const [deleteDialogState, setDeleteDialogState] = useState<UpdateWipDialogState>({open: false});
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

    const navigate = useNavigate();

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
    } = useWipSearch();

    useEffect(() => {
        const fetchInitialWips = async(): Promise<void> => {
           await trySearch(nameQuery); 
        }
        fetchInitialWips();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const searchResult: Result<void> = await trySearch(nameQuery);
        if(searchResult.isSuccessful){
            if(nameQuery.length > 0)
                setSearchResultMessage(`Wip search results for "${nameQuery}"`);
            else
                setSearchResultMessage("All wips");
        }
        else
            Toasts.error(searchResult.message);
    }

    const handlePageQueryOpenChange = (open: boolean) => {
        setIsPageQueryOpen(open);
    }

    const closeRenameDialog = () => {
        setRenameDialogState(prev => ({...prev, open: false}));
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

    const handleRename = async (wipId: string | null | undefined) => {
        
        if(wipId === null || wipId === undefined)
            return;

        if (!renameDialogInput.trim())
            return;
        
        if (renameDialogInput.length < 1 || renameDialogInput.length > MAX_WIP_NAME_LENGTH){
            Toasts.error(`Name must be between 1 and ${MAX_WIP_NAME_LENGTH} characters.`);
            return;
        }

        setIsRenameLoading(true);
        
        const changeWipNameRequest: ChangeWipNameRequest = {
            newName: renameDialogInput
        }
        const changeWipNameResult: Result<void> = await WipService.changeWipName(wipId, changeWipNameRequest);
        if(changeWipNameResult.isSuccessful){
            Toasts.success("Rename successful.");
            await trySearch(nameQuery);
            closeRenameDialog();
        }
        else{
            Toasts.error(changeWipNameResult.message);
        }

        setIsRenameLoading(false);
    }

    const handleDelete = async (wipId: string | null | undefined) => {
        if(wipId === null || wipId === undefined)
            return;
        
        setIsDeleteLoading(true);

        const deleteResult: Result<void> = await WipService.delete(wipId);
        if(deleteResult.isSuccessful){
            Toasts.success("Wip deleted.");
            await trySearch(nameQuery);
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
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">Select Song</Button>
                </DialogTrigger>
                <DialogContent className={`${isMobile ? 'w-full' : 'min-w-[750px]'} h-[770px] flex flex-col`}>
                    <DialogHeader className="text-2xl items-start">
                        <DialogTitle>
                            Select Song
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="w-full flex flex-row space-x-2 items-center pb-4">
                        <Input
                            className="w-full flex-1 w-[500px]"
                            placeholder="Search..."
                            value={nameQuery}
                            onChange={(e) => setNameQuery(e.target.value)}
                        />
                        <Button type="submit" variant="positive" size="icon" className="cursor-pointer">
                            <SearchIcon />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="negative" size="icon" className="cursor-pointer">
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
                                        <DropdownMenuRadioItem value={WipSortField.lastOpened} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                            Sort by most recently opened
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value={WipSortField.name} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                            Sort by name
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value={WipSortField.wipage} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                            Sort by age
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </form>
                    <div className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row items-end justify-between space-x-8 h-10`}>
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
                    <div className="h-[480px] overflow-y-auto -mx-4 px-4 no-scrollbar">
                        <ul className='w-full mt-4 space-y-2 flex flex-col items-center justify-center'>
                            { items.length > 0 ? (
                                items.map((entry) => (
                                    <ContextMenu>
                                        <ContextMenuTrigger>
                                            <li key={entry.id} className={`${isMobile ? 'w-[450px]' : 'w-[700px] flex-1'}`}>
                                                <div 
                                                    onDoubleClick={() => navigate(`/room/${entry.id}`)}
                                                    className="block bg-popover p-4 shadow-md hover:shadow-lg hover:bg-accent transition-all duration-200 border-border border-1 cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-row items-center w-full justify-between space-x-12">
                                                            <span className="flex flex-col min-w-0 justify-between truncate whitespace-nowrap text-ellipsis">
                                                                <span className="text-lg font-semibold text-foreground truncate">{entry.name}</span>
                                                                <span className="flex flex-row space-x-3 text-muted-foreground text-sm">
                                                                    <span>Created {entry.createdOnUTC.toLocaleDateString()}</span>
                                                                    <span>Last opened {entry.lastOpenedOnUTC.toLocaleString()}</span>
                                                                </span>
                                                            </span>
                                                            <div>
                                                                <Button 
                                                                    variant="negative"
                                                                    size="icon"
                                                                    className="cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setDeleteDialogState({
                                                                            open: true,
                                                                            wip: entry
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
                                        </ContextMenuTrigger>
                                        <ContextMenuContent>
                                            <ContextMenuItem>Download (not implemented)</ContextMenuItem>
                                            <ContextMenuSeparator />
                                            <ContextMenuItem
                                                onClick={() => {
                                                    setRenameDialogState({
                                                        open: true,
                                                        wip: entry
                                                    })
                                                    setRenameDialogInput(entry.name);
                                                }}
                                            >
                                                Rename
                                            </ContextMenuItem>
                                            <ContextMenuSeparator />
                                            <ContextMenuItem>Copy (not implemented)</ContextMenuItem>
                                            <ContextMenuSeparator />
                                            <ContextMenuItem>Delete (not implemented)</ContextMenuItem>
                                            <ContextMenuSeparator />
                                            <ContextMenuItem>Share (not implemented)</ContextMenuItem>
                                        </ContextMenuContent>
                                    </ContextMenu>
                                ))
                            ) : (
                                items.length == 0 && <p className="text-muted-foreground">No wips found.</p>
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
                </DialogContent>
            </Dialog>

            <Dialog 
                open={renameDialogState.open} 
                onOpenChange={(open) => {
                    if (!open)
                        closeRenameDialog();
                }} 
            >
                <DialogContent className="w-[425px]">
                    <DialogHeader className="text-left">
                        <DialogTitle className="p-2 break-words wrap-anywhere">
                            Rename "{renameDialogState.wip?.name}"
                        </DialogTitle>
                    </DialogHeader>
                    <Input
                        className="w-full flex-1 w-full"
                        placeholder="Search..."
                        value={renameDialogInput}
                        onChange={(e) => setRenameDialogInput(e.target.value)}
                    />
                    <div className="grid gap-4">
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleRename(renameDialogState.wip?.id)} variant="positive" className="cursor-pointer w-20">
                                {isRenameLoading ? <LoadingIndicator /> : "Confirm"}
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
                <DialogContent className="w-[425px]">
                    <DialogHeader className="text-left">
                        <DialogTitle className="p-2 break-words wrap-anywhere">
                            Confirm deletion of "{deleteDialogState.wip?.name}"
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleDelete(deleteDialogState.wip?.id)} variant="negative" className="cursor-pointer w-20">
                                {isDeleteLoading ? <LoadingIndicator /> : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>

    )
}