import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-result";
import { Toasts } from "@/utils/toasts";
import { useEffect, useState } from "react";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { ScrollArea } from "./ui/scroll-area";

type Message = {
    color: string;
    username: string;
    message: string;
}

interface ChatBoxProps {
    client: TrackerHubClient
} 

export const ChatBox = ({ client }: ChatBoxProps) => {

    const [input, setInput] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const callback = (userId: string, message: string) => {
            const newMessage: Message = {
                color: "black",
                username: userId,
                message: message,
            }
            setMessages(prev => [...prev, newMessage]);
            // todo: add autoscroll to bottom when receiving new message
        }

        const unsubscribeChat = client.onChatMessageReceived(callback);
        
        return () => { 
            unsubscribeChat();
        }; 
    }, []);

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
                {messages.map((message: Message) => (
                    <div>{message.username}: {message.message}</div>
                ))}
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