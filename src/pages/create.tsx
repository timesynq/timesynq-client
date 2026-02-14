import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MusicIcon from "@/assets/svg/music-icon.svg?react";
import PlusIcon from "@/assets/svg/plus-icon.svg?react";
import HeartIcon from "@/assets/svg/heart-icon.svg?react";
import { useTrackerHub } from "@/contexts/tracker-hub-provider";
import { Toasts } from "@/utils/toasts";
import { useNavigate } from "react-router-dom";

export const Create = () => {

    const { createRoom, joinRoom } = useTrackerHub();
    const navigate = useNavigate();

    const tryInitRoom = async(): Promise<void> => {
        const roomCode: string | null = await createRoom();
        if(roomCode === null){

            // temporary
            Toasts.error("couldn't create room");

            return;
        }
        await joinRoom(roomCode);
        navigate(`/room/${roomCode}`);
    }

    return (
        <main className="flex-1 flex flex-col items-center justify-center m-4 mt-4">
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
                                <Button onClick={tryInitRoom} className="w-full" variant="outline">Create New Song</Button>
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
                                    <Button type="submit" variant="positive" className="cursor-pointer">
                                        Join
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
};