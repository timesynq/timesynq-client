import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { Toasts } from "@/utils/toasts";
import { useEffect, useRef, useState } from "react";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { ScrollArea } from "./ui/scroll-area";
import { ChatMessage, Message, RoomMemberInfo, TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { useAtom, useAtomValue } from "jotai";
import { membersAtom, messagesAtom } from "@/atoms/tracker-atoms";

interface ChatBoxProps {
    client: TrackerHubClient;
} 

export const ChatBox = ({ client }: ChatBoxProps) => {

    const members = useAtomValue(membersAtom);
    const [messages, setMessages] = useAtom(messagesAtom);
    const [input, setInput] = useState<string>('');
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages])

    useEffect(() => {
        const chatMessageReceivedCallback = (chatMessage: ChatMessage) => {
            const info: RoomMemberInfo | undefined = members.get(chatMessage.userId);
            const newMessage: Message = {
                color: info?.chatColor ?? "text-timesynq-red",
                username: info?.userName ?? chatMessage.userId,
                message: chatMessage.message,
            }
            setMessages(prev => [...prev, newMessage]);
        }

        const unsubscribeChatMessageReceived = client.subscribeChatMessageReceived(chatMessageReceivedCallback);
        
        return () => { 
            unsubscribeChatMessageReceived();
        }; 
    }, [members]);

    const sendMessage = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        
        if (!input.trim())
            return;
        
        if (input.length < 1 || input.length > 500){
            Toasts.error("Message must be between 1 and 500 characters.");
            return;
        }

        // todo: push the change to list of messages but as status: in transit or something
        // then depending on the result of the call below, change status to either succeeded or failed

        setInput('');

        const result: TrackerHubResult<void> = await client.sendChatMessage(input);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex flex-col justify-center h-12 p-4">
                Chat
            </div>
            <Separator />
            <ScrollArea autoFocus className="flex-1 min-h-0 overflow-y-auto p-4">
                {messages.map((message: Message, index: number) => (
                    <div key={index}>
                        <span className={`${message.color}`}>
                            {message.username}
                        </span>
                        <span>
                            : {message.message}
                        </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </ScrollArea>
            <Separator />
            <div className="h-24 p-4 flex flex-row items-center justify-start space-x-2 bg-background-darker">
                <form onSubmit={sendMessage} className="flex-1">
                    <Input 
                        id="chat"
                        name="chat"
                        placeholder="Say something..."
                        className="h-12 bg-background"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </form>
            </div>
        </div>
    );
}