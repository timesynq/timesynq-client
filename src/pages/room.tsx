import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-result";
import { Wip } from "@/api/wips/wip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-provider";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

export const Room = () => {

    const { user } = useAuth();
    const { wipId } = useParams();
    const trackerHubClientRef = useRef<TrackerHubClient | null>(null);
    const [pageError, setPageError] = useState<string | null>(null);
    const [wipInfo, setWipInfo] = useState<Wip | null>(null);

    if (!user) return null;

    useEffect(() => {
        const setupTrackerHubClient = async (): Promise<void> => {
            if (trackerHubClientRef.current !== null || !wipId)
                return;
            const client = new TrackerHubClient();
            await client.start();
            trackerHubClientRef.current = client;
            const joinRoomResult: TrackerHubResult<Wip> = await trackerHubClientRef.current.joinRoom(wipId);
            if (true || !joinRoomResult.isSuccessful || joinRoomResult.value === null){
                setPageError(joinRoomResult.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
                return;
            }
            setWipInfo(joinRoomResult.value);
        }
        setupTrackerHubClient();
    }, []);

    return (
        <>
            {pageError && 
                <main className="flex flex-col items-center m-4">
                    <Card style={{backgroundColor: "oklch(20.019% 0.04696 287.092)", border: "1px solid oklch(1 0 0 / 10%)"}}>
                        <CardContent className="flex flex-col items-center justify-center space-y-2 p-8 w-[400px]">
                            <p>{pageError}</p>
                            <Link to="/create">
                                <Button variant="link" className="cursor-pointer">Return to options</Button>
                            </Link>     
                        </CardContent>
                    </Card>
                </main>
            }
            {!pageError && 
            <>
                <main className="flex flex-col items-center justify-center">
                    <p>{wipInfo?.id}</p>
                    <p>{wipInfo?.name}</p>
                </main>
            </>
            }
        </>
    );
}