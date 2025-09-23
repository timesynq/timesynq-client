import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import TrashIcon from "@/assets/svg/trash-icon.svg?react";
import { useState } from "react";
import { Toasts } from "@/utils/toasts";
import { UserService } from "@/api/users/user";
import { useAuth } from "@/contexts/auth-provider";

export const DeleteAccountDialog = () => {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { authLogout } = useAuth();
    
    const handleLogout = async (): Promise<void> => {
        const isLogoutSuccessful = await authLogout();
        if (!isLogoutSuccessful) {
            return;
        }
        window.location.reload();
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    }

    const handleDelete = async () => {
        const onError = (description: string) => {Toasts.error(description)};

        const isDeleteSuccessful = await UserService.delete(onError);
        if(isDeleteSuccessful){
            await handleLogout();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="negative" size="icon" className="cursor-pointer">
                    <TrashIcon />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl pb-4">
                        Are you sure?
                    </DialogTitle>
                    <DialogDescription className="text-md pb-4">
                        You will have 30 days to contact support and recover your account if you change your mind. After 30 days, your info will be erased forever.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="cursor-pointer">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleDelete} variant="negative" className="cursor-pointer">Confirm</Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}