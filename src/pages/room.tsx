import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { EXAMPLE_ROOM_INITIALIZER, Message, RoomInitializer, RoomMember, RoomMemberInfo, TrackerConnection, TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { bpmAtom, channelCountAtom, sequencerLengthAtom, setIndividualSequencerLinesAtom, setMemberAtom, setMembersAtom, setRemoveMemberAtom, wipMetadataAtom } from "@/atoms/tracker-atoms";
import { ChatBox } from "@/components/chat-box";
import { FrameEditor } from "@/components/frame-editor";
import { OwnerOnlyWipOptions } from "@/components/owner-only-wip-options";
import { Sequencer } from "@/components/sequencer";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { WipOptions } from "@/components/wip-options";
import { useAuth } from "@/contexts/auth-provider";
import { SelectionProvider } from "@/contexts/selection-provider";
import { generateRandomChatColor } from "@/utils/chat-color";
import { createStore, Provider, useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingIndicator from "@/assets/svg/loading-indicator.svg?react";

export const Room = () => {
    const { wipId } = useParams();
    const store = useMemo(() => createStore(), [wipId]);

    return (
        <Provider store={store}>
            <SelectionProvider>
                <RoomInner wipId={wipId} />
            </SelectionProvider>
        </Provider>
    );
}

interface RoomInnerProps {
    wipId: string | undefined;
}

const RoomInner = ({ wipId }: RoomInnerProps) => {

    const navigate = useNavigate();
    const { user } = useAuth();
    const clientRef = useRef<TrackerHubClient | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [pageError, setPageError] = useState<string | null>(null);
    const [accessExpired, setAccessExpired] = useState<boolean>(false);

    if (!user) return null;

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

    const [, setMember] = useAtom(setMemberAtom);
    const [, setRemoveMember] = useAtom(setRemoveMemberAtom);
    const [, setMembers] = useAtom(setMembersAtom);
    const setWipMetadata = useSetAtom(wipMetadataAtom);
    const setInitialBpm = useSetAtom(bpmAtom);
    const setInitialChannelCount = useSetAtom(channelCountAtom);
    const setSequencerLength = useSetAtom(sequencerLengthAtom);
    const [, setIndividualSequencerLines] = useAtom(setIndividualSequencerLinesAtom);

    useEffect(() => {
        let unsubscribeUserJoinedRoom      = (): boolean => { return false; }
        let unsubscribeUserLeftRoom        = (): boolean => { return false; }
        let unsubscribeAccessExpired       = (): boolean => { return false; }
        let unsubscribeWipNameUpdated      = (): boolean => { return false; }
        const setupTrackerHubClient = async (): Promise<(void)> => {
            if (clientRef.current !== null || !wipId)
                return;
            const newClient = new TrackerHubClient();
            clientRef.current = newClient;

            // register TrackerHubClient listeners here
            const userJoinedRoomCallback = (roomMember: RoomMember) => {
                const firstJoinServerMessage: Message = serverMessage(`${roomMember.userName} has joined the room.`);
                setMember({ member: roomMember, firstJoinServerMessage });
            }
            unsubscribeUserJoinedRoom = newClient.subscribeUserJoinedRoom(userJoinedRoomCallback);
            
            const userLeftRoomCallback = (trackerConnection: TrackerConnection) => {
                const finalLeaveServerMessageFactory = (userName: string): Message => serverMessage(`${userName} has left the room.`);
                setRemoveMember({ trackerConnection, finalLeaveServerMessageFactory });
            }
            unsubscribeUserLeftRoom = newClient.subscribeUserLeftRoom(userLeftRoomCallback);

            const accessExpiredCallback = () => {
                setAccessExpired(true);
            }
            unsubscribeAccessExpired = newClient.subscribeAccessExpired(accessExpiredCallback);

            const wipNameUpdatedCallback = (newName: string) => {
                setWipMetadata(prev => {
                    if (prev === null) 
                        return prev;
                    return {
                        ...prev,
                        name: newName
                    };
                });
            }
            unsubscribeWipNameUpdated = newClient.subscribeWipNameUpdated(wipNameUpdatedCallback);

            await newClient.start();
            const joinRoomResult: TrackerHubResult<RoomInitializer> = await newClient.joinRoom(wipId);
            if (!joinRoomResult.isSuccessful || joinRoomResult.value === null){
                setPageError(joinRoomResult.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
                setIsReady(true);
                return;
            }

            //setWipMetadata(joinRoomResult.value.wip);
            //setInitialBpm(joinRoomResult.value.bpm);
            //setInitialBpm(joinRoomResult.value.channelCount);

            //const existingMembers = initializeMembers(joinRoomResult.value.members);
            //setMembers({ existingMembers });
            
            const dummyRoomInitailizer: RoomInitializer = EXAMPLE_ROOM_INITIALIZER;
            setWipMetadata(dummyRoomInitailizer.wip);
            setInitialBpm(dummyRoomInitailizer.bpm);
            setInitialChannelCount(dummyRoomInitailizer.channelCount);
            setMembers({ existingMembers: new Map<string, RoomMemberInfo>() });
            setSequencerLength(dummyRoomInitailizer.sequencer.length);
            setIndividualSequencerLines({ lines: dummyRoomInitailizer.sequencer.lines });

            setIsReady(true);
        }

        setupTrackerHubClient();
        return () => {
            unsubscribeUserJoinedRoom();
            unsubscribeUserLeftRoom();
            unsubscribeAccessExpired();
            unsubscribeWipNameUpdated();
            handleLeaveRoom();
            clientRef.current?.stop();
            clientRef.current = null;
            setIsReady(false);
        }
    }, [wipId]);

    const handleLeaveRoom = async () => {
        if (!clientRef.current) 
            return;
        await clientRef.current.leaveRoom();
    }

    if (isReady) {
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
                {!pageError && clientRef.current !== null &&
                    <>
                        <main className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden">
                            <div className="flex flex-row items-center justify-start w-full h-14 p-2 space-x-2">
                                <OwnerOnlyWipOptions userId={user.id} wipId={wipId} />
                                <WipOptions client={clientRef.current} />
                            </div>
                            <Separator />
                            <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
                                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                                    <Sequencer
                                        client={clientRef.current}
                                    />
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={60} minSize={45} maxSize={70}>
                                    <div className="flex-1 flex h-full items-center justify-center">
                                        <FrameEditor
                                            client={clientRef.current}
                                        />
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
                                    <ChatBox 
                                        client={clientRef.current}
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
    else {
        return (
            <main className="flex-1 flex flex-col items-center justify-center m-4">
                <LoadingIndicator className="w-8 text-foreground"/>
            </main>
        )
    }
}