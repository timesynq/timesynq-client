import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProfilePicture } from "./profile-picture";
import { SharedUser, ShareWipRequest, WipService } from "@/api/wips/wip";
import { Result } from "@/api/result";
import { Toasts } from "@/utils/toasts";
import TrashIcon from "@/assets/svg/trash-icon.svg?react";
import LoadingIndicator from "@/assets/svg/loading-indicator.svg?react";
import SearchIcon from "@/assets/svg/search-icon.svg?react";
import { Input } from "./ui/input";
import { useUserSearch } from "@/hooks/use-user-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Page } from "@/api/paged-list";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "./ui/pagination";
import PlusIcon from "@/assets/svg/plus-icon.svg?react";
import { User } from "@/api/users/user";

export interface WipShareDialogProps {
    wipId: string | undefined,
    trigger?: React.ReactNode, 
}

interface ShareConfirmationDialogState {
    open: boolean,
    user?: User,
}

interface DeleteOneDialogState {
    open: boolean,
    user?: SharedUser,
}

export const WipShareDialog = ({wipId, trigger}: WipShareDialogProps) => {

    const isMobile = useIsMobile();
    const [userQuery, setUserQuery] = useState<string>("");
    const [shareConfirmationDialogState, setShareConfirmationDialogState] = useState<ShareConfirmationDialogState>({open: false});
    const [isShareLoading, setIsShareLoading] = useState<boolean>(false);
    const [deleteOneDialogState, setDeleteOneDialogState] = useState<DeleteOneDialogState>({open: false});
    const [isDeleteOneLoading, setIsDeleteOneLoading] = useState<boolean>(false);
    const [deleteAllDialogState, setDeleteAllDialogState] = useState<boolean>(false);
    const [isDeleteAllLoading, setIsDeleteAllLoading] = useState<boolean>(false);
    const [usersWithAccess, setUsersWithAccess] = useState<SharedUser[]>([]);   

    const {
        items,
        pageNumber,
        totalPages,
        trySearch,
        tryGoTo
    } = useUserSearch();

    useEffect(() => {
        const fetchUsersWithAccess = async () => {
            if (!wipId) return;
            const getSharedUsersResult: Result<SharedUser[]> = await WipService.getSharedUsers(wipId);
            if (!getSharedUsersResult.isSuccessful)
                Toasts.error(getSharedUsersResult.message);
            else
                setUsersWithAccess(getSharedUsersResult.value);
        }

        fetchUsersWithAccess();
    }, []);

    const closeShareConfirmationDialog = () => {
        setShareConfirmationDialogState(prev => ({...prev, open: false}));
    }

    const closeDeleteOneDialog = () => {
        setDeleteOneDialogState(prev => ({...prev, open: false}));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const searchResult: Result<void> = await trySearch(userQuery);
        if(!searchResult.isSuccessful)
            Toasts.error(searchResult.message);
    }

    const handleTryGoTo = async (page: Page) => {
        await tryGoTo(page);
    }

    const handleShareWip = async(userId: string | null | undefined) => {
        if(userId === null || userId === undefined || wipId == undefined)
            return;

        setIsShareLoading(true);

        const shareWipRequest: ShareWipRequest = {
            shareWithId: userId
        }
        const shareResult: Result<User> = await WipService.share(wipId, shareWipRequest);
        if(shareResult.isSuccessful){
            Toasts.success("Wip invite sent.");
            if(!usersWithAccess.find(value => value.id == userId)){
                setUsersWithAccess(prev => [
                    ...prev,
                    {...shareResult.value, isAccepted: false}
                ]);
            }
            closeShareConfirmationDialog();
        }
        else{
            Toasts.error(shareResult.message);
        }

        setIsShareLoading(false);
    }

    const handleDeleteOne = async (userId: string | null | undefined) => {
        if(userId === null || userId === undefined || wipId == undefined)
            return;
        
        setIsDeleteOneLoading(true);

        const deleteResult: Result<void> = await WipService.unshareOne(wipId, userId);
        if(deleteResult.isSuccessful){
            Toasts.success("Unshare successful.");
            await handleRefresh();
            closeDeleteOneDialog();
        }
        else{
            Toasts.error(deleteResult.message);
        }
        setIsDeleteOneLoading(false);
    }

    const handleRefresh = async () => {
        if (!wipId) return;
        const getSharedUsersResult: Result<SharedUser[]> = await WipService.getSharedUsers(wipId);
        if (!getSharedUsersResult.isSuccessful)
            Toasts.error(getSharedUsersResult.message);
        else
            setUsersWithAccess(getSharedUsersResult.value);
    }

    const handleDeleteAll = async () => {
        if (wipId == undefined)
            return;

        setIsDeleteAllLoading(true);

        const deleteResult: Result<void> = await WipService.unshareAll(wipId);
        if(deleteResult.isSuccessful){
            Toasts.success("Wip has been unshared with all users.");
            await handleRefresh();
            setDeleteAllDialogState(false);
        }
        else{
            Toasts.error(deleteResult.message);
        }
        setIsDeleteAllLoading(false);
    }

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    {
                        trigger ??
                            <Button variant="link" className="text-foreground cursor-pointer text-lg">Share</Button>
                    }
                </DialogTrigger>
                <DialogContent className={`${isMobile ? 'w-full' : 'min-w-[750px]'} h-[780px] flex flex-col`}>
                    <DialogHeader className="text-2xl items-start">
                        <DialogTitle>
                            Manage Wip Access
                        </DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="+">
                        <TabsList className="my-2">
                            <TabsTrigger value="+">Add</TabsTrigger>
                            <TabsTrigger value="-">Remove</TabsTrigger>
                        </TabsList>

                        <TabsContent value="+">
                            <div>
                                <form onSubmit={handleSubmit} className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row items-center space-x-2 pb-4`}>
                                    <Input
                                        className="w-full flex-1 w-[500px]"
                                        placeholder="Search..."
                                        value={userQuery}
                                        onChange={(e) => setUserQuery(e.target.value)}
                                    />
                                    <Button type="submit" variant="positive" size="icon" className="cursor-pointer">
                                        <SearchIcon />
                                    </Button>
                                </form>
                                <div className={`${isMobile ? 'w-full' : 'min-w-[700px]'} flex flex-row items-end justify-between space-x-8 h-10`}>
                                    <p className="w-[50%] text-sm "></p>
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
                                <div className="h-[540px] overflow-y-auto no-scrollbar">
                                    <ul className={`${isMobile ? 'w-full' : 'min-w-[600px]'} mt-4 space-y-2 flex flex-col items-center justify-center`}>
                                        { items.length > 0 ? (
                                            items.map((entry) => (
                                                <li key={entry.id} className={`${isMobile ? 'w-full' : 'min-w-[700px] flex-1'}`}>
                                                    <Link
                                                        to={`/profile/${entry.id}`}
                                                        target="_blank"
                                                        className="block bg-popover p-4 shadow-md hover:shadow-lg hover:bg-accent transition-all duration-200 border-border border-1"
                                                    >
                                                        <div className="flex flex-row items-center justify-between">
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
                                                            <Button 
                                                                variant="positive"
                                                                size="icon"
                                                                className="cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setShareConfirmationDialogState({
                                                                        open: true,
                                                                        user: entry
                                                                    });
                                                                }}
                                                            >
                                                                <PlusIcon />
                                                            </Button>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))
                                        ) : (
                                            items.length == 0 && <p className="text-muted-foreground">No users found.</p>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="-">
                            <Button 
                                variant="outline"
                                className="cursor-pointer"
                                onClick={handleRefresh}
                            >
                                Refresh
                            </Button>
                            <div className="h-[530px] overflow-y-auto no-scrollbar my-4">
                                <ul className={`${isMobile ? 'w-full' : 'min-w-[600px]'} space-y-2 flex flex-col items-center justify-center`}>
                                    { usersWithAccess.length > 0 ? (
                                        usersWithAccess.map((entry) => (
                                            <li key={entry.id} className={`${isMobile ? 'w-full' : 'min-w-[700px] flex-1'}`}>
                                                <Link
                                                    to={`/profile/${entry.id}`}
                                                    target="_blank"
                                                    className="block bg-popover p-4 shadow-md hover:shadow-lg hover:bg-accent transition-all duration-200 border-border border-1"
                                                >
                                                    <div className="flex flex-row items-center justify-between">
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
                                                        <Button 
                                                            variant="negative"
                                                            size="icon"
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setDeleteOneDialogState({
                                                                    open: true,
                                                                    user: entry
                                                                })
                                                            }}
                                                        >
                                                            <TrashIcon />
                                                        </Button>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))
                                    ) : (
                                        usersWithAccess.length == 0 && <p className="text-muted-foreground">No users found.</p>
                                    )}
                                </ul>
                            </div>  
                            <DialogFooter>
                                { usersWithAccess.length > 0 &&
                                    <Button 
                                        variant="negative"
                                        onClick={() => setDeleteAllDialogState(true)}
                                        className="cursor-pointer"
                                    >
                                        Remove all
                                    </Button>
                                }
                            </DialogFooter>
                        </TabsContent>

                    </Tabs>       
                </DialogContent>
            </Dialog>

            <Dialog 
                open={shareConfirmationDialogState.open} 
                onOpenChange={(open) => {
                    if (!open)
                        closeShareConfirmationDialog();
                }} 
            >
                <DialogContent className="max-w-[425px]">
                    <DialogHeader className="text-left">
                        <DialogTitle>
                            Share this wip with {shareConfirmationDialogState.user?.userName}?
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleShareWip(shareConfirmationDialogState.user?.id)} variant="positive" className="cursor-pointer w-20">
                                {isShareLoading ? <LoadingIndicator /> : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog 
                open={deleteOneDialogState.open} 
                onOpenChange={(open) => {
                    if (!open)
                        closeDeleteOneDialog();
                }} 
            >
                <DialogContent className="max-w-[425px]">
                    <DialogHeader className="text-left">
                        <DialogTitle>
                            Unshare this wip with {deleteOneDialogState.user?.userName}?
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleDeleteOne(deleteOneDialogState.user?.id)} variant="negative" className="cursor-pointer w-20">
                                {isDeleteOneLoading ? <LoadingIndicator /> : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog 
                open={deleteAllDialogState} 
                onOpenChange={(open) => setDeleteAllDialogState(open)} 
            >
                <DialogContent className="max-w-[425px]">
                    <DialogHeader className="text-left">
                        <DialogTitle>
                            Unshare this wip with all users?
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleDeleteAll} variant="negative" className="cursor-pointer w-20">
                                {isDeleteAllLoading ? <LoadingIndicator /> : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

        </>
    );
}