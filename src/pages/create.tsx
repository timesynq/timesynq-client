import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MusicIcon from "@/assets/svg/music-icon.svg?react";
import PlusIcon from "@/assets/svg/plus-icon.svg?react";
import HeartIcon from "@/assets/svg/heart-icon.svg?react";
import { Toasts } from "@/utils/toasts";
import { useNavigate } from "react-router-dom";
import { Wip, WipService } from "@/api/wips/wip";
import { WipSearchDialog } from "@/components/wip-search-dialog";

export const Create = () => {

    const navigate = useNavigate();

    const createNewWip = async(): Promise<void> => {
        const newWip: Wip | null = await WipService.create((description: string) => {Toasts.error(description)});
        if (newWip !== null){
            navigate(`/room/${newWip.id}`);
        }
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
                                <WipSearchDialog isShared={false}/>
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
                                <Button onClick={createNewWip} className="w-full" variant="outline">Create New Song</Button>
                            </CardFooter>
                        </Card>
                        <Card className="flex flex-col items-center justify-between p-4 text-center">
                            <CardHeader className="flex flex-col items-center justify-center space-y-8">
                                <HeartIcon className="w-12 h-12 text-timesynq-red" />
                                <CardTitle className="text-lg font-semibold">Open Room with Shared Song</CardTitle>
                            </CardHeader>
                            <CardContent className="w-full">
                                <p className="text-sm text-muted-foreground">Load a work in progress that was shared with you.</p>
                            </CardContent>
                            <CardFooter className="w-full mt-4">
                                <WipSearchDialog isShared={true}/>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
};