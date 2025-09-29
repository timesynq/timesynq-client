import { resetPassword, ResetPasswordError, ResetPasswordRequest, sendResetCode, SendResetCodeError, SendResetCodeRequest } from "@/api/auth/password";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toasts } from "@/utils/toasts";
import { useState } from "react";

export const ForgotPassword = () => {

    const isMobile = useIsMobile();
    const [sendResetCodeErrors, setSendResetCodeErrors] = useState<SendResetCodeError | null>(null);
    const [resetPasswordErrors, setResetPasswordErrors] = useState<ResetPasswordError | null>(null);

    const handleSendResetCode = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const request: SendResetCodeRequest = {
            email: formData.get("email") as string,
        };

        const sendResetCodeError = await sendResetCode(request);

        if (sendResetCodeError) {
            setSendResetCodeErrors(sendResetCodeError);
            return;
        }

        setResetPasswordErrors(null);
        setSendResetCodeErrors(null);
        Toasts.success("Password reset code sent.");
    }

    const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const request: ResetPasswordRequest = {
            email: formData.get("email") as string,
            resetCode: formData.get("reset-code") as string,
            newPassword: formData.get("new-password") as string,
        }

        const resetPasswordError = await resetPassword(request);

        if(resetPasswordError) {
            setResetPasswordErrors(resetPasswordError);
            return;
        }

        setSendResetCodeErrors(null);
        setResetPasswordErrors(null);
        Toasts.success("Password successfully reset.");
    }

    return (
        <main className="flex flex-col items-center m-4">
            <Card style={{backgroundColor: "oklch(20.019% 0.04696 287.092)", border: "1px solid oklch(1 0 0 / 10%)"}}>
                <CardHeader>
                    Forgot Password
                </CardHeader>
                <CardContent className={`${isMobile ? "w-[80vw]": "w-[600px]"} flex flex-col items-center justify-center space-y-4`}>
                    <Separator />
                    <form onSubmit={handleSendResetCode} className="flex flex-row items-center justify-start w-full space-x-2">
                        <Label htmlFor="email" className="w-[33%]">Email</Label>
                        <div className="flex flex-row w-[102%] space-x-2">
                            <Input id="email" name="email" placeholder="user@example.com"/>
                            <Button type="submit" variant="positive" className="cursor-pointer">
                                Send
                            </Button>
                        </div>
                    </form>
                    {sendResetCodeErrors && (
                        <div className="text-destructive text-sm flex flex-col justify-start w-full">
                            {sendResetCodeErrors.detail && <p>{sendResetCodeErrors.detail}</p>}
                            {!sendResetCodeErrors.detail && sendResetCodeErrors.errors.map((e, index) => (
                                <p key={index}>{e}</p>
                            ))}
                        </div>
                    )}
                    <Separator />
                    <form onSubmit={handleResetPassword} className="flex flex-col items-center justify-start w-full space-y-2">
                        <div className="flex flex-row items-center justify start w-full space-x-2">
                            <Label htmlFor="email" className="w-[33%]">Email</Label>
                            <Input id="email" name="email" placeholder="user@example.com"/>
                        </div>
                        <div className="flex flex-row items-center justify-start w-full space-x-2">
                            <Label htmlFor="reset-code" className="w-[33%]">Reset Code</Label>
                            <Input id="reset-code" name="reset-code"/>
                        </div>
                        <div className="flex flex-row items-center justify-start w-full space-x-2">
                            <Label htmlFor="new-password" className="w-[33%]">New Password</Label>
                            <Input type="password" id="new-password" name="new-password"/>
                        </div>
                        {resetPasswordErrors && (
                            <div className="text-destructive text-sm flex flex-col justify-start w-full">
                                {resetPasswordErrors.detail && <p>{resetPasswordErrors.detail}</p>}
                                {!resetPasswordErrors.detail && resetPasswordErrors.errors.map((e, index) => (
                                    <p key={index}>{e}</p>
                                ))}
                            </div>
                        )}
                        <div className="flex flex-row items-center justify-end w-full">
                            <Button type="submit" variant="positive" className="cursor-pointer">
                                Submit
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}