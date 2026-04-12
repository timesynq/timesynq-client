import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { RoomInitializer, RoomMember, TrackerConnection, TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { Wip, WIP_CONSTANTS } from "@/api/wips/wip";
import { ChatBox, Message } from "@/components/chat-box";
import { Counter } from "@/components/counter";
import { FrameEditor } from "@/components/frame-editor";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { WipOptionsDialog } from "@/components/wip-options-dialog";
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

    const navigate = useNavigate();
    const { user } = useAuth();
    const { wipId } = useParams();
    const trackerHubClientRef = useRef<TrackerHubClient | null>(null);
    const [pageError, setPageError] = useState<string | null>(null);
    const [wipInfo, setWipInfo] = useState<Wip | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [accessExpired, setAccessExpired] = useState<boolean>(false);

    const [members, setMembers] = useState<Map<string, RoomMemberInfo>>(new Map<string, RoomMemberInfo>());
    const membersRef = useRef<Map<string, RoomMemberInfo>>(members);
    useEffect(() => {
        membersRef.current = members;
    }, [members]);

    const [bpm, setBpm] = useState<number>(120 /*temporary, this will be read from the server*/);
    const handleBpmCounterUpdate = async (newBpm: number): Promise<void> => {
        if (trackerHubClientRef.current === null)
            return;
        const result: TrackerHubResult<void> = await trackerHubClientRef.current.updateBpm(newBpm);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }

    const [channelCount, setChannelCount] = useState<number>(4 /*temporary, this will be read from the server*/);
    const handleChannelCounterUpdate = async (newChannelCount: number): Promise<void> => {
        if (trackerHubClientRef.current === null)
            return;
        const result: TrackerHubResult<void> = await trackerHubClientRef.current.updateChannelCount(newChannelCount);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }

    if (!user) return null;

    const generateRandomChatColor = useCallback((): string => {
        const possibleColors = [
            "text-timesynq-red",
            "text-timesynq-green",
            "text-timesynq-blue",
        ]
        const randomIndex: number = Math.floor(Math.random() * (possibleColors.length));
        return possibleColors[randomIndex];
    }, []);

    const serverMessage = useCallback((message: string): Message => {
        return {
            color: "text-muted-foreground",
            username: "SERVER",
            message: message,
        }
    }, []);

    const initializeMembers = useCallback((roomMembers: RoomMember[]): Map<string, RoomMemberInfo> => {
        const initialMembers = new Map<string, RoomMemberInfo>();

        roomMembers.forEach((roomMember) => {
            let roomMemberInfo: RoomMemberInfo | undefined = initialMembers.get(roomMember.userId);
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
        await client.leaveRoom();
    }

    useEffect(() => {
        let unsubscribeUserJoinedRoom = (): boolean => {
            return false;
        }
        let unsubscribeUserLeftRoom = (): boolean => {
            return false;
        }
        let unsubscribeAccessExpired = (): boolean => {
            return false;
        }
        let unsubscribeWipNameChanged = (): boolean => {
            return false;
        }
        let unsubscribeBpmUpdated = (): boolean => {
            return false;
        }
        let unsubscribeChannelCountUpdated = (): boolean => {
            return false;
        }

        const setupTrackerHubClient = async (): Promise<(void)> => {
            if (trackerHubClientRef.current !== null || !wipId)
                return;
            const client = new TrackerHubClient();

            // register TrackerHubClient listeners here
            const userJoinedRoomCallback = (roomMember: RoomMember) => {
                let roomMemberInfo: RoomMemberInfo | undefined = membersRef.current.get(roomMember.userId);
                if (!roomMemberInfo){
                    const set = new Set<string>();
                    const color: string = generateRandomChatColor();
                    roomMemberInfo = {
                        userName: roomMember.userName,
                        connectionIds: set,
                        chatColor: color,
                    }
                    membersRef.current.set(roomMember.userId, roomMemberInfo);
                    setMessages(prev => [...prev, serverMessage(`${roomMember.userName} has joined the room.`)]);
                }    
                roomMemberInfo.connectionIds.add(roomMember.connectionId);
                setMembers(new Map<string, RoomMemberInfo>(membersRef.current));
            }
            unsubscribeUserJoinedRoom = client.onUserJoinedRoom(userJoinedRoomCallback);
            
            const userLeftRoomCallback = (trackerConnection: TrackerConnection) => {
                let roomMemberInfo: RoomMemberInfo | undefined = membersRef.current.get(trackerConnection.userId);
                if (!roomMemberInfo)
                    return;
                roomMemberInfo.connectionIds.delete(trackerConnection.connectionId);
                if(roomMemberInfo.connectionIds.size === 0){
                    setMessages(prev => [...prev, serverMessage(`${roomMemberInfo.userName} has left the room.`)]);
                    membersRef.current.delete(trackerConnection.userId);
                }
                setMembers(new Map<string, RoomMemberInfo>(membersRef.current));
            }
            unsubscribeUserLeftRoom = client.onUserLeftRoom(userLeftRoomCallback);

            const accessExpiredCallback = () => {
                setAccessExpired(true);
            }
            unsubscribeAccessExpired = client.onAccessExpired(accessExpiredCallback);

            const wipNameChangedCallback = (newName: string) => {
                setWipInfo(prev => {
                    if (prev === null) 
                        return prev;
                    return {
                        ...prev,
                        name: newName
                    };
                });
            }
            unsubscribeWipNameChanged = client.onWipNameChanged(wipNameChangedCallback);

            const bpmUpdatedCallback = (newBpm: number) => {
                setBpm(newBpm);
            }
            unsubscribeBpmUpdated = client.onBpmUpdated(bpmUpdatedCallback);

            const channelCountUpdatedCallback = (newChannelCount: number) => {
                setChannelCount(newChannelCount);
            }
            unsubscribeChannelCountUpdated = client.onChannelCountUpdated(channelCountUpdatedCallback);

            await client.start();
            trackerHubClientRef.current = client;
            const joinRoomResult: TrackerHubResult<RoomInitializer> = await trackerHubClientRef.current.joinRoom(wipId);
            if (!joinRoomResult.isSuccessful || joinRoomResult.value === null){
                setPageError(joinRoomResult.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
                return;
            }
            setWipInfo(joinRoomResult.value.wip);
            setMembers(prev => {
                const existingMembers = initializeMembers(joinRoomResult.value!.members);
                return new Map([...prev, ...existingMembers]);
            });
        }

        setupTrackerHubClient();
        return () => {
            unsubscribeUserJoinedRoom();
            unsubscribeUserLeftRoom();
            unsubscribeAccessExpired();
            unsubscribeWipNameChanged();
            unsubscribeBpmUpdated();
            unsubscribeChannelCountUpdated();
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
                <>
                    <main className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-auto">
                        <div className="flex flex-row items-center justify-start w-full h-14 p-2 space-x-2">
                            {user.id === wipInfo?.ownerId && <WipOptionsDialog wip={wipInfo}/>}
                            {user.id === wipInfo?.ownerId && <WipShareDialog wipId={wipId}/>} 
                            <Counter 
                                label="BPM"
                                value={bpm}
                                min={WIP_CONSTANTS.MIN_BPM}
                                max={WIP_CONSTANTS.MAX_BPM}
                                onChange={handleBpmCounterUpdate}
                            />
                            <Counter 
                                label="Channels"
                                value={channelCount}
                                min={WIP_CONSTANTS.MIN_CHANNELS}
                                max={WIP_CONSTANTS.MAX_CHANNELS}
                                onChange={handleChannelCounterUpdate}
                            />
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
                                <div className="flex-1 flex h-full items-center justify-center">
                                    <FrameEditor/>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="flex flex-col">
                                <ChatBox 
                                    client={trackerHubClientRef.current}
                                    members={members}
                                    messages={messages}
                                    setMessages={setMessages}
                                />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </main>
                    { accessExpired &&
                        <AlertDialog open={accessExpired}>
                            <AlertDialogContent className="max-w-[425px]">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Access Expired
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Your access to view and edit this wip has expired.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <Button 
                                        variant="negative"
                                        onClick={() => navigate("/create")} 
                                        className="cursor-pointer"
                                    >
                                        Exit
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    }
                </>
            }
        </>
    );
}