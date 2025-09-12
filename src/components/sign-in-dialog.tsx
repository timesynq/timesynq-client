import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function SignInDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="signin" className="cursor-pointer">Sign in</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Sign in
                    </DialogTitle>
                </DialogHeader>
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
                    <div className="text-destructive">
                        <p>error 1</p>
                        <p>error 2</p>
                    </div>
                <DialogFooter>
                    <Button variant="link" className="cursor-pointer">Forgot password?</Button>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button type="submit" variant="signin">Sign in</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}