import { NavBar } from "@/components/nav-bar";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MusicIcon from "@/assets/svg/music-icon.svg?react";
import PlusIcon from "@/assets/svg/plus-icon.svg?react";
import HeartIcon from "@/assets/svg/heart-icon.svg?react";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavBarFooter } from "@/components/nav-bar-footer";

export const Create = () => {
    const { user, isLoading, fetchUser } = useAuthStore();
    const isMobile: boolean = useIsMobile();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (!user && !isLoading) {
        return <Navigate to="/" state={{ open: "signin" }} replace />;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-1 flex flex-col items-center justify-center m-4 mt-4">
                {isLoading ? (
                    <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                ) : (
                    <div className="flex items-center justify-center px-4 mb-4">
                        <div className="flex flex-col items-center justify-center space-y-6 max-w-5xl w-full">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold">Create Session</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                <Card className="flex flex-col items-center justify-between p-4 text-center">
                                    <CardHeader className="flex flex-col items-center justify-center space-y-8">
                                        <MusicIcon className="w-12 h-12 text-timesynq-blue" />
                                        <CardTitle className="text-lg font-semibold">Open Room with Existing Song</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">Load a work in progress.</p>
                                    </CardContent>
                                    <CardFooter className="w-full mt-4">
                                        <Button className="w-full" variant="outline">Select Song</Button>
                                    </CardFooter>
                                </Card>
                                <Card className="flex flex-col items-center justify-between p-4 text-center">
                                    <CardHeader className="flex flex-col items-center justify-center space-y-8">
                                        <PlusIcon className="w-12 h-12 text-timesynq-green" />
                                        <CardTitle className="text-lg font-semibold">Open Room from New Song</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">Create something from scratch.</p>
                                    </CardContent>
                                    <CardFooter className="w-full mt-4">
                                        <Button className="w-full" variant="outline">Create New Song</Button>
                                    </CardFooter>
                                </Card>
                                <Card className="flex flex-col items-center justify-between p-4 text-center">
                                    <CardHeader className="flex flex-col items-center justify-center space-y-8">
                                        <HeartIcon className="w-12 h-12 text-timesynq-red" />
                                        <CardTitle className="text-lg font-semibold">Join Room</CardTitle>
                                    </CardHeader>
                                    <CardContent className="w-full">
                                        <p className="text-sm text-muted-foreground">Enter a room code to join an existing session.</p>
                                    </CardContent>
                                    <CardFooter className="w-full mt-4 flex flex-col items-center justify-center space-y-4">
                                        <div className="flex w-full max-w-sm items-center gap-2">
                                            <Input placeholder="Enter room code" />
                                            <Button type="submit" variant="positive">
                                                Join
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {isMobile &&
                <NavBarFooter />
            }
        </div>
    );
};