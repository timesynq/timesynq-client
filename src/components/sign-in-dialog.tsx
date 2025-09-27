import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LoginError, LoginRequest } from "@/api/auth/login";
import { useAuth } from "@/contexts/auth-provider";
import { Checkbox } from "./ui/checkbox";

export const SignInDialog = ({ autoOpen = false }: { autoOpen?: boolean }) => {

    const [errors, setErrors] = useState<LoginError | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { authLogin } = useAuth();

    useEffect(() => {
        if (autoOpen) {
            setIsOpen(true);
        }
    }, [autoOpen]);

    const handleOpenChange = (open: boolean) => {
        if(open){
            setErrors(null);
        }
        setIsOpen(open);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const request: LoginRequest = {
            username: formData.get("username") as string,
            password: formData.get("password") as string,
            rememberMe: formData.get("remember-me") === "on",
        };

        const loginError = await authLogin(request);

        if (loginError) {
            setErrors(loginError);
            return;
        }

        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="positive" className="cursor-pointer w-16">Sign in</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Sign in
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" defaultValue="" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Password</Label>
                            <Input type="password" id="password" name="password" defaultValue="" />
                        </div>
                    </div>
                    <div className="flex flex-row items-center space-x-2">
                        <Checkbox id="remember-me" name="remember-me" className="cursor-pointer" defaultChecked={false}/>
                        <Label htmlFor="remember-me" className="cursor-pointer">Remember me</Label>
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
                        <Button variant="link" className="cursor-pointer">Forgot password?</Button>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                        <Button type="submit" variant="positive">Sign in</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}