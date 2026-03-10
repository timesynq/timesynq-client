import { ProfilePicture } from "@/components/profile-picture";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-provider";
import { useIsLg } from "@/hooks/use-lg";
import CheckIcon from "@/assets/svg/check-icon.svg?react";
import { Toasts } from "@/utils/toasts";
import { ChangeUsernameRequest, UserService } from "@/api/users/user";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { changeEmail, ChangeEmailRequest, EmailStatus, resendConfirmationEmail, ResendConfirmationEmailRequest } from "@/api/auth/email";
import LoadingIndicator from "@/assets/svg/loading-indicator.svg?react";
import { Result } from "@/api/result";

export const AccountSettings = () => {

    const { user } = useAuth(); 
    const isLg: boolean = useIsLg();
    const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
    const [isChangeUsernameLoading, setIsChangeUsernameLoading] = useState<boolean>(false);
    const [isChangeEmailLoading, setIsChangeEmailLoading] = useState<boolean>(false);
    const [isResendConfirmationEmailLoading, setIsResendConfirmationEmailLoading] = useState<boolean>(false);

    if(!user) return;

    useEffect(() => {
        const emailStatus: EmailStatus = {
            email: user.email,
            isEmailConfirmed: user.emailConfirmed,
        }
        setEmailStatus(emailStatus);
    }, [user]);

    const handleUsernameChange = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsChangeUsernameLoading(true);

        const formData = new FormData(event.currentTarget);
        const changeUsernameRequest: ChangeUsernameRequest = {
            newUserName: formData.get("username") as string
        }

        if(changeUsernameRequest.newUserName == user.userName){
            Toasts.error("Already using username.");
            return;
        }

        const changeUsernameResult: Result<void> = await UserService.changeUsername(changeUsernameRequest);
        if(changeUsernameResult.isSuccessful){
            Toasts.success("Username changed successfully.");
        }
        else{
            Toasts.error(changeUsernameResult.message);
        }

        setIsChangeUsernameLoading(false);
    }

    const handleEmailChange = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsChangeEmailLoading(true);

        const formData = new FormData(event.currentTarget);

        const changeEmailRequest: ChangeEmailRequest = {
            oldEmail: emailStatus ? emailStatus.email : "", 
            newEmail: formData.get("email") as string
        }

        const onSuccess = (description: string) => {Toasts.success(description)};
        const onError = (description: string) => {Toasts.error(description)};

        const newEmailStatus = await changeEmail(changeEmailRequest, onSuccess, onError);

        if(newEmailStatus){
            setEmailStatus(newEmailStatus);
        }

        setIsChangeEmailLoading(false);
    } 

    const handleResendConfirmationEmail = async () => {
        if(!emailStatus){
            return;
        }

        setIsResendConfirmationEmailLoading(true);
        const request: ResendConfirmationEmailRequest = {
            email: emailStatus.email,
        }

        const isResendSuccessful = await resendConfirmationEmail(request, (description: string) => {Toasts.error(description)});
        if(isResendSuccessful){
            Toasts.success("Verification email sent!");
        }
        setIsResendConfirmationEmailLoading(false);
    }

    return (
        <main className="flex flex-col items-center justify-center m-4 mt-8">
            <div className={`flex ${!isLg ? 'flex-col w-[90%]' : 'flex-row min-w-[50%]'} gap-8`}>
                <Card className={`${!isLg ? 'w-full h-[50%]' : 'w-[350px] max-h-[300px]'} bg-muted rounded-lg shrink-0`}>
                    <CardHeader className="flex flex-col items-center justify-center">
                        <ProfilePicture data={user.profilePicture} size={15} />
                        <p className="text-2xl mt-2">{user.userName}</p>
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex flex-row items-center justify-around py-2">
                        <div className="flex flex-col items-center space-y-1">
                        <p className="text-foreground text-lg font-medium">{user.followerCount}</p>
                        <p className="text-muted-foreground text-sm">Followers</p>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                        <p className="text-foreground text-lg font-medium">{user.followeeCount}</p>
                        <p className="text-muted-foreground text-sm">Following</p>
                        </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex flex-col items-center justify-center space-y-3 p-4">
                        <p className="text-muted-foreground text-sm">
                            Joined {user.createdOnUTC.toLocaleDateString()}
                        </p>
                    </CardFooter>
                </Card>
                <div className={`${!isLg ? 'w-full' : 'min-w-[600px] flex-1 mt-16'} flex-col space-y-8`}>
                    <Card>
                        <CardHeader className="text-lg">
                            Profile Information
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <form onSubmit={handleUsernameChange} className="flex flex-row items-center justify-start w-full space-x-2">
                                <Label htmlFor="username" className="w-20">Username</Label>
                                <Input id="username" name="username" defaultValue={user.userName} />
                                <Button type="submit" variant="positive" size="icon" className="min-w-[36px] cursor-pointer">
                                    {isChangeUsernameLoading ? <LoadingIndicator /> : <CheckIcon className="mr-0.5"/>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="text-lg">
                            Security
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <div className="flex flex-row items-center justify-between w-full">
                                <form onSubmit={handleEmailChange} className="flex flex-row items-center justify-start w-full space-x-2">
                                    <Label htmlFor="email" className="w-20">Email</Label>
                                    <Input type="email" id="email" name="email" disabled={!emailStatus?.isEmailConfirmed} defaultValue={emailStatus?.email}/>
                                    {!emailStatus?.isEmailConfirmed && 
                                        <Button type="button" onClick={handleResendConfirmationEmail} variant="negative" className="cursor-pointer text-xs min-w-40">
                                            {isResendConfirmationEmailLoading ? <LoadingIndicator /> : "Resend Confirmation Email"}
                                        </Button> 
                                    }
                                    {emailStatus?.isEmailConfirmed &&
                                        <Button type="submit" variant="positive" size="icon" className="min-w-[36px] cursor-pointer">
                                            {isChangeEmailLoading ? <LoadingIndicator /> : <CheckIcon className="mr-0.5"/>}
                                        </Button>
                                    }
                                </form>
                            </div>
                            <Separator />
                            <div className="flex flex-row items-center justify-between w-full">
                                <p>Password</p>
                                <div className="flex flex-row space-x-1">
                                    <Link to="/forgot-password">
                                        <Button variant="link" className="cursor-pointer text-xs">
                                            Forgot Password
                                        </Button>
                                    </Link>
                                    <ChangePasswordDialog />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="text-lg">
                            Account Actions
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <Separator />
                            <div className="flex flex-row items-center justify-between w-full">
                                <p>Delete Account</p>
                                <DeleteAccountDialog />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}