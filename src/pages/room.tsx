import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { RoomInitializer, RoomMember, TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { Wip } from "@/api/wips/wip";
import { ChatBox } from "@/components/chat-box";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadingIndicator from "@/assets/svg/loading-indicator.svg?react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { WipShareDialog } from "@/components/wip-share-dialog";
import { useAuth } from "@/contexts/auth-provider";
import { Toasts } from "@/utils/toasts";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export type RoomMemberInfo = {
    userName: string,
    connectionIds: Set<string>,
    chatColor: string,
}

export const Room = () => {

    const { user } = useAuth();
    const { wipId } = useParams();
    const trackerHubClientRef = useRef<TrackerHubClient | null>(null);
    const [pageError, setPageError] = useState<string | null>(null);
    const [wipInfo, setWipInfo] = useState<Wip | null>(null);
    const [members, setMembers] = useState<Map<string, RoomMemberInfo>>(new Map<string, RoomMemberInfo>())
    const navigate = useNavigate();

    if (!user) return null;

    const generateRandomChatColor = (): string => {
        const possibleColors = [
            "text-timesynq-red",
            "text-timesynq-green",
            "text-timesynq-blue",
        ]
        const randomIndex: number = Math.floor(Math.random() * (possibleColors.length));
        return possibleColors[randomIndex];
    }

    const initializeMembers = useCallback((roomMembers: RoomMember[]): Map<string, RoomMemberInfo> => {
        const initialMembers = new Map<string, RoomMemberInfo>();

        roomMembers.forEach((roomMember) => {
            let roomMemberInfo = initialMembers.get(roomMember.userId);
            if (!roomMemberInfo){
                const set = new Set<string>();
                const color: string = generateRandomChatColor();
                roomMemberInfo = {
                    userName: roomMember.userName,
                    connectionIds: set,
                    chatColor: color,
                }
                initialMembers.set(roomMember.userId, roomMemberInfo);
            }    
            roomMemberInfo.connectionIds.add(roomMember.connectionId);
        });

        return initialMembers;
    }, []);

    const handleLeaveRoom = async () => {
        const client = trackerHubClientRef.current;
        if (!client) 
            return;
        const leaveRoom: TrackerHubResult<void> = await client.leaveRoom();
        if (leaveRoom.isSuccessful) 
            return;
        else 
            Toasts.error(leaveRoom.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
    }

    useEffect(() => {
        let unsubscribeUserJoinedRoom = (): boolean => {
            return false;
        }
        const setupTrackerHubClient = async (): Promise<(void)> => {
            if (trackerHubClientRef.current !== null || !wipId)
                return;
            const client = new TrackerHubClient();

            // register TrackerHubClient listeners here
            const callback = (roomMember: RoomMember) => {
                let roomMemberInfo = members.get(roomMember.userId);
                if (!roomMemberInfo){
                    const set = new Set<string>();
                    const color: string = generateRandomChatColor();
                    roomMemberInfo = {
                        userName: roomMember.userName,
                        connectionIds: set,
                        chatColor: color,
                    }
                    members.set(roomMember.userId, roomMemberInfo);
                }    
                roomMemberInfo.connectionIds.add(roomMember.connectionId); 
                setMembers(new Map<string, RoomMemberInfo>(members));
            }
            unsubscribeUserJoinedRoom = client.onUserJoinedRoom(callback);
            
            await client.start();
            trackerHubClientRef.current = client;
            const joinRoomResult: TrackerHubResult<RoomInitializer> = await trackerHubClientRef.current.joinRoom(wipId);
            if (!joinRoomResult.isSuccessful || joinRoomResult.value === null){
                setPageError(joinRoomResult.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
                return;
            }
            setWipInfo(joinRoomResult.value.wip);
            setMembers(initializeMembers(joinRoomResult.value.members));

        }

        setupTrackerHubClient();
        return () => {
            unsubscribeUserJoinedRoom();

        }
    }, []);

    useEffect(() => {
        return () => {
            handleLeaveRoom();
        };
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
            {!pageError && trackerHubClientRef.current !== null &&
                <main className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-auto">
                    <div className="flex flex-row items-center justify-between w-full h-14 p-2">
                        <WipShareDialog wipId={wipId}/>
                    </div>
                    <Separator />
                    <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
                        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
                            <div className="flex-1 flex items-center justify-center">
                                {wipInfo?.name}
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={60} minSize={50} maxSize={70}>
                            <div className="flex-1 flex items-center justify-center">
                                {wipInfo?.id}
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="flex flex-col">
                            <ChatBox client={trackerHubClientRef.current} members={members}/>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </main>
            }
        </>
    );
}