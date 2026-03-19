import * as signalR from "@microsoft/signalr";
import { hubs } from "../endpoints";
import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { RoomInitializer, RoomMember, TrackerConnection, TrackerHubResult } from "./tracker-hub-models";

const TrackerHubServerFunctions = {
    JoinRoom: "JoinRoom",
    LeaveRoom: "LeaveRoom",
    SendChatMessage: "SendChatMessage",
}

const TrackerHubClientCallbacks = {
    UserJoinedRoom: "UserJoinedRoom",
    UserLeftRoom: "UserLeftRoom",
    MessageAddedToChat: "MessageAddedToChat",
    AccessExpired: "AccessExpired",
}

export class TrackerHubClient{

    private _connection: signalR.HubConnection;
    private _chatMessageListeners: Set<(userId: string, message: string) => void>;
    private _userJoinedRoomListeners: Set<(roomMember: RoomMember) => void>;
    private _userLeftRoomListeners: Set<(trackerConnection: TrackerConnection) => void>;
    private _accessExpiredListeners: Set<() => void>;

    constructor(){
        this._connection = new signalR.HubConnectionBuilder()
            .withUrl(hubs.tracker())
            .withAutomaticReconnect()
            .build();

        this._chatMessageListeners = new Set<(userId: string, message: string) => void>();
        this._userJoinedRoomListeners = new Set<(roomMember: RoomMember) => void>();
        this._userLeftRoomListeners = new Set<(trackerConnection: TrackerConnection) => void>();
        this._accessExpiredListeners = new Set<() => void>();
        this.registerListeners();
    }

    private registerListeners(): void {
        this._connection.on(
            TrackerHubClientCallbacks.MessageAddedToChat,
            (userId: string, message: string) => {
                this._chatMessageListeners.forEach(callback => callback(userId, message));
            }
        )
        this._connection.on(
            TrackerHubClientCallbacks.UserJoinedRoom,
            (roomMember: RoomMember) => {
                this._userJoinedRoomListeners.forEach(callback => callback(roomMember));
            }
        )
        this._connection.on(
            TrackerHubClientCallbacks.UserLeftRoom,
            (trackerConnection: TrackerConnection) => {
                this._userLeftRoomListeners.forEach(callback => callback(trackerConnection));
            }
        )
        this._connection.on(
            TrackerHubClientCallbacks.AccessExpired,
            () => {
                this._accessExpiredListeners.forEach(callback => callback());
            }
        )
    }

    onChatMessageReceived(callback: (userId: string, message: string) => void): () => boolean {
        this._chatMessageListeners.add(callback);
        return () => this._chatMessageListeners.delete(callback);
    }

    onUserJoinedRoom(callback: (roomMember: RoomMember) => void): () => boolean {
        this._userJoinedRoomListeners.add(callback);
        return () => this._userJoinedRoomListeners.delete(callback);
    }

    onUserLeftRoom(callback: (trackerConnection: TrackerConnection) => void): () => boolean {
        this._userLeftRoomListeners.add(callback);
        return () => this._userLeftRoomListeners.delete(callback);
    }

    onAccessExpired(callback: () => void): () => boolean {
        this._accessExpiredListeners.add(callback);
        return () => this._accessExpiredListeners.delete(callback);
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

    async joinRoom(roomCode: string): Promise<TrackerHubResult<RoomInitializer>> {
        return this.updateRoomState<RoomInitializer>(
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