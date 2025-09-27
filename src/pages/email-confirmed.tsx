import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export const EmailConfirmed = () => {
    return (
        <main className="flex flex-col items-center m-4">
            <Card>
                <CardContent className="flex flex-col items-center justify-center space-y-2 p-8 w-[400px]">
                    <p>Thank you for confirming your email!</p>
                    <Link to="/">
                        <Button variant="link" className="cursor-pointer">Return to home</Button>
                    </Link>     
                </CardContent>
            </Card>
        </main>
    );
}