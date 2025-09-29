import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { RegisterError } from "@/api/auth/register";
import { changePassword, ChangePasswordRequest } from "@/api/auth/password";
import { Toasts } from "@/utils/toasts";

export const ChangePasswordDialog = () => {

    const [errors, setErrors] = useState<RegisterError | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleOpenChange = (open: boolean) => {
        if(open){
            setErrors(null);
        }
        setIsOpen(open);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const changePasswordRequest: ChangePasswordRequest = {
            oldPassword: formData.get("old-password") as string,
            newPassword: formData.get("new-password") as string,
        };

        const changePasswordError = await changePassword(changePasswordRequest, (description: string) => {Toasts.success(description)});

        if (changePasswordError) {
            setErrors(changePasswordError);
            return;
        }

        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer text-xs ">
                    Change Password
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Change Password
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="old-password">Old Password</Label>
                            <Input type="password" id="old-password" name="old-password" defaultValue="" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input type="password" id="new-password" name="new-password" defaultValue="" />
                        </div>
                    </div>
                    {errors && (
                        <div className="text-destructive text-sm">
                            {errors.detail && <p>{errors.detail}</p>}
                            {!errors.detail && errors.errors.map((e, index) => (
                                <p key={index}>{e}</p>
                            ))}
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                        <Button type="submit" variant="positive">Submit</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );

}