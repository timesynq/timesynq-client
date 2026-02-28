import * as signalR from "@microsoft/signalr";
import { hubs } from "../endpoints";
import { TrackerHubResult } from "./tracker-hub-result";
import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { Wip } from "../wips/wip";

const TrackerHubServerFunctions = {
    JoinRoom: "JoinRoom",
    LeaveRoom: "LeaveRoom",
    SendChatMessage: "SendChatMessage",
}

const TrackerHubClientCallbacks = {
    UserJoinedRoom: "UserJoinedRoom",
    UserLeftRoom: "UserLeftRoom",
    MessageAddedToChat: "MessageAddedToChat",
}

export class TrackerHubClient{

    private _connection: signalR.HubConnection;
    private _chatMessageListeners: Set<(userId: string, message: string) => void>; 
    

    constructor(){
        this._connection = new signalR.HubConnectionBuilder()
            .withUrl(hubs.tracker())
            .withAutomaticReconnect()
            .build();

        this._chatMessageListeners = new Set<(userId: string, message: string) => void>();
        this.registerListeners();
    }

    private registerListeners(): void {
        this._connection.on(
            TrackerHubClientCallbacks.MessageAddedToChat,
            (userId: string, message: string) => {
                this._chatMessageListeners.forEach(callback => callback(userId, message));
            }
        )   
    }

    onChatMessageReceived(callback: (userId: string, message: string) => void): () => boolean {
        this._chatMessageListeners.add(callback);
        return () => this._chatMessageListeners.delete(callback);
    }

    private serverError<T>(): TrackerHubResult<T> {
        const result: TrackerHubResult<T> = {
            isSuccessful: false,
            errorMessage: UNEXPECTED_ERROR_MESSAGE,
            value: null,
        }
        return result;
    }

    async start(): Promise<void> {
        if(this._connection.state !== signalR.HubConnectionState.Disconnected)
            return;
        await this._connection.start().catch((error) => {
            if(import.meta.env.DEV) console.error(error);
        });
    }

    async stop(): Promise<void> {
        if(this._connection.state !== signalR.HubConnectionState.Connected)
            return;
        await this._connection.stop().catch((error) => {
            if(import.meta.env.DEV) console.error(error);
        });
    }

    async joinRoom(roomCode: string): Promise<TrackerHubResult<Wip>> {
        return this.updateRoomState<Wip>(
            TrackerHubServerFunctions.JoinRoom,
            roomCode
        );
    }

    async leaveRoom(): Promise<TrackerHubResult<void>> {
        return this.updateRoomState<void>(
            TrackerHubServerFunctions.LeaveRoom
        );
    }

    private async updateRoomState<T> (trackerHubServerFunction: string, ...args: string[]): Promise<TrackerHubResult<T>> {
        const result = await this._connection.invoke<TrackerHubResult<T>>(trackerHubServerFunction, ...args)
            .catch(() => {
                return this.serverError<T>();
            });
        return result;
    }

    async sendChatMessage(message: string): Promise<TrackerHubResult<void>> {
        const result = await this._connection.invoke<TrackerHubResult<void>>(TrackerHubServerFunctions.SendChatMessage, message)
            .catch(() => {
                return this.serverError<void>();
            });
        return result;
    }
}