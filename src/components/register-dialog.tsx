import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function RegisterDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="register" className="cursor-pointer">Register</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Register
                    </DialogTitle>
                </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" defaultValue="" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" name="email" defaultValue="" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Password</Label>
                            <Input type="password" id="password" name="password" defaultValue="" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input type="password" id="confirm-password" name="confirm-password" defaultValue="" />
                        </div>
                    </div>
                    <div className="text-destructive">
                        <p>error 1</p>
                        <p>error 2</p>
                    </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button type="submit" variant="register">Register</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}