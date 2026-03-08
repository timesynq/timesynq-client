import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import SearchIcon from "@/assets/svg/search-icon.svg?react";
import SettingsIcon from "@/assets/svg/settings-icon.svg?react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { useWipSearch } from "@/hooks/use-wip-search";
import { Page } from "@/api/paged-list";
import { Toasts } from "@/utils/toasts";
import { Wip, WipService, WipShareSortField, WipSortField } from "@/api/wips/wip";
import TrashIcon from "@/assets/svg/trash-icon.svg?react";
import LoadingIndicator from "@/assets/svg/loading-indicator.svg?react";

export interface WipSearchDialogProps {
    isShared: boolean
}

interface DeleteDialogState {
    open: boolean,
    wip?: Wip
}

export const WipSearchDialog = ({isShared}: WipSearchDialogProps) => {

    const isMobile = useIsMobile();
    const [nameQuery, setNameQuery] = useState<string>("");
    const [searchResultMessage, setSearchResultMessage] = useState<string>("All wips");
    const [isPageQueryOpen, setIsPageQueryOpen] = useState<boolean>(false);
    const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>({open: false});
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

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
    } = useWipSearch(isShared, (description: string) => Toasts.error(description));

    useEffect(() => {
        const fetchInitialWips = async(): Promise<void> => {
           await trySearch(nameQuery); 
        }
        fetchInitialWips();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const succeeded: boolean = await trySearch(nameQuery);
        if(succeeded){
            if(nameQuery.length > 0)
                setSearchResultMessage(`Wip search results for "${nameQuery}"`);
            else
                setSearchResultMessage("All wips");
        }
    }

    const handlePageQueryOpenChange = (open: boolean) => {
        setIsPageQueryOpen(open);
    }

    const closeDeleteDialog = () => {
        setDeleteDialogState(prev => ({...prev, open: false}));
    }

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        const input = Number(e.target.value);
        if (!isNaN(input))
            updatePageSize(input);
    }

    const handlePageQuery = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const input: string = formData.get("page-number") as string;
        const newPageNumber = parseInt(input);
        
        if(isNaN(newPageNumber)){
            return;
        }

        queryByPage(newPageNumber);
        setIsPageQueryOpen(false);
    }

    const handleDelete = async (wipId: string | null | undefined) => {
        if(wipId === null || wipId === undefined)
            return;
        
        setIsDeleteLoading(true);

        const onError = (description: string) => {Toasts.error(description)};

        const isDeleteSuccessful = await WipService.delete(wipId, onError);
        if(isDeleteSuccessful){
            Toasts.success("Wip deleted.");
            await trySearch(nameQuery);
            closeDeleteDialog();
        }
        setIsDeleteLoading(false);
    }

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">Select Song</Button>
                </DialogTrigger>
                <DialogContent className={`${isMobile ? 'w-full' : 'min-w-[750px]'} h-[770px] flex flex-col`}>
                    <DialogHeader className="text-2xl">
                        <DialogTitle>
                            Select Song
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="w-full flex flex-row items-center space-x-2 pb-4">
                        <Input
                            className="w-full"
                            placeholder="Search..."
                            value={nameQuery}
                            onChange={(e) => setNameQuery(e.target.value)}
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
                                    onCheckedChange={() => updateSortOrder(!sortReverse)}
                                >
                                    Reverse sort
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={sortBy} onValueChange={updateSortBy}>
                                        { isShared && 
                                            <>
                                                <DropdownMenuRadioItem value={WipShareSortField.name} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                    Sort by name
                                                </DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value={WipShareSortField.shareAge} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                    Sort by most recently shared
                                                </DropdownMenuRadioItem>
                                            </>
                                        }
                                        {
                                            !isShared &&
                                            <>
                                                <DropdownMenuRadioItem value={WipSortField.name} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                    Sort by name
                                                </DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value={WipSortField.lastOpened} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                    Sort by most recently opened
                                                </DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value={WipSortField.wipage} onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                                    Sort by age
                                                </DropdownMenuRadioItem>
                                            </> 
                                        }
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
                                        <PaginationPrevious onClick={() => tryGoTo(Page.Previous)} className={`${pageNumber == 1 ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <p>Page {pageNumber} of {totalPages}</p>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext onClick={() => tryGoTo(Page.Next)} className={`${pageNumber == totalPages ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`}/>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        }
                    </div>
                    <div className="h-[480px] overflow-y-auto -mx-4 px-4 no-scrollbar">
                        <ul className={`${isMobile ? 'w-full' : 'min-w-[600px]'} mt-4 space-y-2 flex flex-col items-center justify-center`}>
                            { items.length > 0 ? (
                                items.map((entry) => (
                                    <li key={entry.id} className={`${isMobile ? 'w-full' : 'min-w-[700px] flex-1'}`}>
                                        <div className="block bg-popover p-4 shadow-md hover:shadow-lg hover:bg-accent transition-all duration-200 border-border border-1 cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col w-full">
                                                    <span className="flex flex-row justify-between text-lg font-semibold text-foreground">
                                                        <span>{entry.name}</span>
                                                        <div>
                                                            <Button 
                                                                variant="negative"
                                                                size="icon"
                                                                className="cursor-pointer"
                                                                onClick={() => setDeleteDialogState({
                                                                    open: true,
                                                                    wip: entry
                                                                })}
                                                            >
                                                                <TrashIcon />
                                                            </Button>
                                                        </div>
                                                    </span>
                                                    <span className="flex flex-row space-x-3 text-muted-foreground text-sm">
                                                        <span>Created {entry.createdOnUTC.toLocaleDateString()}</span>
                                                        <span>Last opened {entry.lastOpenedOnUTC.toLocaleString()}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                items.length == 0 && <p className="text-muted-foreground">No wips found.</p>
                            )}
                        </ul>
                    </div>
                    { items.length > 0 &&
                        <div className="flex flex-row items-center justify-between space-x-2 my-4">
                            <Button variant="outline" onClick={() => tryGoTo(Page.First)} className={`${pageNumber == 1 ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`}>First</Button>
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
                                onClick={() => tryGoTo(Page.Last)}
                                className={`${pageNumber == totalPages ? 'hover:bg-background hover:text-muted-foreground text-muted-foreground' : 'cursor-pointer'}`}
                            >
                                Last
                            </Button>
                        </div>
                    }
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
                            Confirm deletion of {deleteDialogState.wip?.name}
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