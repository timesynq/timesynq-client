import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { register, RegisterError, RegisterRequest } from "@/api/auth/register";
import { LoginRequest } from "@/api/auth/login";
import { useAuthStore } from "@/hooks/use-auth-store";

export function RegisterDialog() {

    const [errors, setErrors] = useState<RegisterError | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { login } = useAuthStore();

    const handleOpenChange = (open: boolean) => {
        if(open){
            setErrors(null);
        }
        setIsOpen(open);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const registerRequest: RegisterRequest = {
            username: formData.get("username") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirm-password") as string,
        };

        const registerError = await register(registerRequest);

        if (registerError) {
            setErrors(registerError);
            return;
        }

        const loginRequest: LoginRequest = {
            username: registerRequest.username,
            password: registerRequest.password,
        }

        const loginError = await login(loginRequest);
        
        if (loginError) {
            loginError.detail = `Login failed after successful registration. ${loginError.detail}`;
            setErrors(loginError);
            return;
        }

        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="register" className="cursor-pointer">Register</Button>
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
                            <Input type="password" id="password" name="password" defaultValue="" placeholder="must be at least 12 characters"/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input type="password" id="confirm-password" name="confirm-password" defaultValue="" />
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
                        <Button type="submit" variant="register">Register</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}