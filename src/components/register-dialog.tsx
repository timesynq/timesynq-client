import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { register, RegisterError, RegisterRequest } from "@/api/auth/register";
import { LoginRequest } from "@/api/auth/login";
import { Toasts } from "@/utils/toasts";
import { useAuth } from "@/contexts/auth-provider";
import { Checkbox } from "./ui/checkbox";
import LoadingIndicator from "@/assets/svg/loading-indicator.svg?react";

export const RegisterDialog = () => {

    const [dialogShowPassword, setDialogShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<RegisterError | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isRegisterLoading, setIsRegisterLoading] = useState<boolean>(false);
    const { authLogin } = useAuth();

    const handleOpenChange = (open: boolean) => {
        if(open){
            setErrors(null);
        }
        setIsOpen(open);
    }

    const handleDialogShowPassword = (checked: boolean) => {
        setDialogShowPassword(checked);
    }


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsRegisterLoading(true);

        const formData = new FormData(event.currentTarget);
        const registerRequest: RegisterRequest = {
            username: formData.get("username") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirm-password") as string,
        };

        const registerError = await register(registerRequest, (description: string) => {Toasts.success(description)});

        if (registerError) {
            setErrors(registerError);
            setIsRegisterLoading(false);
            return;
        }

        const loginRequest: LoginRequest = {
            username: registerRequest.username,
            password: registerRequest.password,
            rememberMe: false,
        }

        const loginError = await authLogin(loginRequest);

        if (loginError) {
            loginError.detail = `Login failed after successful registration. ${loginError.detail}`;
            setErrors(loginError);
            setIsRegisterLoading(false);
            return;
        }

        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="negative" className="cursor-pointer w-20">Register</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Register
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" defaultValue="" placeholder="3-24 characters, letters, numbers, underscores"/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" name="email" defaultValue="" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Password</Label>
                            <Input type={dialogShowPassword ? "text" : "password"} id="password" name="password" defaultValue="" placeholder="must be at least 12 characters"/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input type={dialogShowPassword ? "text" : "password"} id="confirm-password" name="confirm-password" defaultValue="" />
                        </div>
                    </div>
                    <div className="flex flex-row items-center space-x-2">
                        <Checkbox id="show-password" name="show-password" className="cursor-pointer" defaultChecked={false} onCheckedChange={handleDialogShowPassword}/>
                        <Label htmlFor="show-password" className="cursor-pointer">Show password</Label>
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
                            <Button variant="outline" className="cursor-pointer">Close</Button>
                        </DialogClose>
                        <Button type="submit" variant="negative" className="cursor-pointer w-20">
                            {isRegisterLoading ? <LoadingIndicator /> : "Register"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}