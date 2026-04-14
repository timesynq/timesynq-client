import * as signalR from "@microsoft/signalr";
import { hubs } from "../endpoints";
import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { RoomInitializer, RoomMember, TrackerConnection, TrackerHubResult } from "./tracker-hub-models";
import { UpdateSequencerFrameCommand } from "./tracker-hub-commands";

const TrackerHubServerFunctions = {
    JoinRoom: "JoinRoom",
    LeaveRoom: "LeaveRoom",
    SendChatMessage: "SendChatMessage",
    UpdateBpm: "UpdateBpm",
    UpdateChannelCount: "UpdateChannelCount",
    UpdateSequencerLength: "UpdateSequencerLength",
    UpdateSequencerFrame: "UpdateSequencerFrame",
}

const TrackerHubClientCallbacks = {
    UserJoinedRoom: "UserJoinedRoom",
    UserLeftRoom: "UserLeftRoom",
    MessageAddedToChat: "MessageAddedToChat",
    AccessExpired: "AccessExpired",
    WipNameChanged: "WipNameChanged",
    BpmUpdated: "BpmUpdated",
    ChannelCountUpdated: "ChannelCountUpdated",
    SequencerLengthUpdated: "SequencerLengthUpdated",
    SequencerFrameUpdated: "SequencerFrameUpdated",
}

export class TrackerHubClient{

    private _connection: signalR.HubConnection;
    private _chatMessageListeners: Set<(userId: string, message: string) => void>;
    private _userJoinedRoomListeners: Set<(roomMember: RoomMember) => void>;
    private _userLeftRoomListeners: Set<(trackerConnection: TrackerConnection) => void>;
    private _accessExpiredListeners: Set<() => void>;
    private _wipNameChangedListeners: Set<(newName: string) => void>;
    private _bpmUpdatedListeners: Set<(newBpm: number) => void>;
    private _channelCountUpdatedListeners: Set<(newChannelCount: number) => void>;
    private _sequencerLengthUpdatedListeners: Set<(newSequencerLength: number) => void>;
    private _sequencerFrameUpdatedListeners: Set<(command: UpdateSequencerFrameCommand) => void>;

    constructor(){
        this._connection = new signalR.HubConnectionBuilder()
            .withUrl(hubs.tracker())
            .withAutomaticReconnect()
            .build();

        this._chatMessageListeners = new Set<(userId: string, message: string) => void>();
        this._userJoinedRoomListeners = new Set<(roomMember: RoomMember) => void>();
        this._userLeftRoomListeners = new Set<(trackerConnection: TrackerConnection) => void>();
        this._accessExpiredListeners = new Set<() => void>();
        this._wipNameChangedListeners = new Set<(newName: string) => void>();
        this._bpmUpdatedListeners = new Set<(newBpm: number) => void>();
        this._channelCountUpdatedListeners = new Set<(newChannelCount: number) => void>();
        this._sequencerLengthUpdatedListeners = new Set<(newSequencerLength: number) => void>();
        this._sequencerFrameUpdatedListeners = new Set<(command: UpdateSequencerFrameCommand) => void>();
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
        this._connection.on(
            TrackerHubClientCallbacks.WipNameChanged,
            (newName: string) => {
                this._wipNameChangedListeners.forEach(callback => callback(newName));
            }
        )
        this._connection.on(
            TrackerHubClientCallbacks.BpmUpdated,
            (newBpm: number) => {
                this._bpmUpdatedListeners.forEach(callback => callback(newBpm));
            }
        )
        this._connection.on(
            TrackerHubClientCallbacks.ChannelCountUpdated,
            (newChannelCount: number) => {
                this._channelCountUpdatedListeners.forEach(callback => callback(newChannelCount));
            }
        )
        this._connection.on(
            TrackerHubClientCallbacks.SequencerLengthUpdated,
            (newSequencerLength: number) => {
                this._sequencerLengthUpdatedListeners.forEach(callback => callback(newSequencerLength));
            }
        )
        this._connection.on(
            TrackerHubClientCallbacks.SequencerFrameUpdated,
            (command: UpdateSequencerFrameCommand) => {
                this._sequencerFrameUpdatedListeners.forEach(callback => callback(command));
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

    onWipNameChanged(callback: (newName: string) => void): () => boolean {
        this._wipNameChangedListeners.add(callback);
        return () => this._wipNameChangedListeners.delete(callback);
    }

    onBpmUpdated(callback: (newBpm: number) => void): () => boolean {
        this._bpmUpdatedListeners.add(callback);
        return () => this._bpmUpdatedListeners.delete(callback);
    }

    onChannelCountUpdated(callback: (newChannelCount: number) => void): () => boolean {
        this._channelCountUpdatedListeners.add(callback);
        return () => this._channelCountUpdatedListeners.delete(callback);
    }

    onSequencerLengthUpdated(callback: (newSequencerLength: number) => void): () => boolean {
        this._sequencerLengthUpdatedListeners.add(callback);
        return () => this._sequencerLengthUpdatedListeners.delete(callback);
    }

    onSequencerFrameUpdated(callback: (command: UpdateSequencerFrameCommand) => void): () => boolean {
        this._sequencerFrameUpdatedListeners.add(callback);
        return () => this._sequencerFrameUpdatedListeners.delete(callback);
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

    async updateBpm(newBpm: number): Promise<TrackerHubResult<void>> {
        const result = await this._connection.invoke<TrackerHubResult<void>>(TrackerHubServerFunctions.UpdateBpm, newBpm)
            .catch(() => {
                return this.serverError<void>();
            });
        return result;
    }

    async updateChannelCount(newChannelCount: number): Promise<TrackerHubResult<void>> {
        const result = await this._connection.invoke<TrackerHubResult<void>>(TrackerHubServerFunctions.UpdateChannelCount, newChannelCount)
            .catch(() => {
                return this.serverError<void>();
            });
        return result;
    }

    async updateSequencerLength(newSequencerLength: number): Promise<TrackerHubResult<void>> {
        const result = await this._connection.invoke<TrackerHubResult<void>>(TrackerHubServerFunctions.UpdateSequencerLength, newSequencerLength)
            .catch(() => {
                return this.serverError<void>();
            });
        return result;
    }

    async updateSequencerFrame(command: UpdateSequencerFrameCommand): Promise<TrackerHubResult<void>> {
        const result = await this._connection.invoke<TrackerHubResult<void>>(TrackerHubServerFunctions.UpdateSequencerFrame, command)
            .catch(() => {
                return this.serverError<void>();
            });
        return result;
    }
}