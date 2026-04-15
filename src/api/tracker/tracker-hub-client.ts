import * as signalR from "@microsoft/signalr";
import { hubs } from "../endpoints";
import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { RoomInitializer, RoomMember, TrackerConnection, TrackerHubResult } from "./tracker-hub-models";
import { UpdateSequencerChannelCommand, UpdateSequencerFrameCommand } from "./tracker-hub-commands";

const TrackerHubServerFunctions = {
    JoinRoom: "JoinRoom",
    LeaveRoom: "LeaveRoom",
    SendChatMessage: "SendChatMessage",
    UpdateBpm: "UpdateBpm",
    UpdateChannelCount: "UpdateChannelCount",
    UpdateSequencerLength: "UpdateSequencerLength",
    UpdateSequencerFrame: "UpdateSequencerFrame",
    UpdateSequencerChannel: "UpdateSequencerChannel",
}

const TrackerHubEvents = {
    UserJoinedRoom: "UserJoinedRoom",
    UserLeftRoom: "UserLeftRoom",
    MessageAddedToChat: "MessageAddedToChat",
    AccessExpired: "AccessExpired",
    WipNameUpdated: "WipNameUpdated",
    BpmUpdated: "BpmUpdated",
    ChannelCountUpdated: "ChannelCountUpdated",
    SequencerLengthUpdated: "SequencerLengthUpdated",
    SequencerFrameUpdated: "SequencerFrameUpdated",
    SequencerChannelUpdated: "SequencerChannelUpdated",
}

export class TrackerHubClient{

    private _connection: signalR.HubConnection;
    private _chatMessageListeners: Set<(userId: string, message: string) => void>;
    private _userJoinedRoomListeners: Set<(roomMember: RoomMember) => void>;
    private _userLeftRoomListeners: Set<(trackerConnection: TrackerConnection) => void>;
    private _accessExpiredListeners: Set<() => void>;
    private _wipNameUpdatedListeners: Set<(newName: string) => void>;
    private _bpmUpdatedListeners: Set<(newBpm: number) => void>;
    private _channelCountUpdatedListeners: Set<(newChannelCount: number) => void>;
    private _sequencerLengthUpdatedListeners: Set<(newSequencerLength: number) => void>;
    private _sequencerFrameUpdatedListeners: Set<(command: UpdateSequencerFrameCommand) => void>;
    private _sequencerChannelUpdatedListeners: Set<(command: UpdateSequencerChannelCommand) => void>;

    constructor(){
        this._connection = new signalR.HubConnectionBuilder()
            .withUrl(hubs.tracker())
            .withAutomaticReconnect()
            .build();

        this._chatMessageListeners = new Set<(userId: string, message: string) => void>();
        this._userJoinedRoomListeners = new Set<(roomMember: RoomMember) => void>();
        this._userLeftRoomListeners = new Set<(trackerConnection: TrackerConnection) => void>();
        this._accessExpiredListeners = new Set<() => void>();
        this._wipNameUpdatedListeners = new Set<(newName: string) => void>();
        this._bpmUpdatedListeners = new Set<(newBpm: number) => void>();
        this._channelCountUpdatedListeners = new Set<(newChannelCount: number) => void>();
        this._sequencerLengthUpdatedListeners = new Set<(newSequencerLength: number) => void>();
        this._sequencerFrameUpdatedListeners = new Set<(command: UpdateSequencerFrameCommand) => void>();
        this._sequencerChannelUpdatedListeners = new Set<(command: UpdateSequencerChannelCommand) => void>(); 
        this.registerListeners();
    }

    private registerListeners(): void {
        this._connection.on(
            TrackerHubEvents.MessageAddedToChat,
            (userId: string, message: string) => {
                this._chatMessageListeners.forEach(callback => callback(userId, message));
            }
        )
        this._connection.on(
            TrackerHubEvents.UserJoinedRoom,
            (roomMember: RoomMember) => {
                this._userJoinedRoomListeners.forEach(callback => callback(roomMember));
            }
        )
        this._connection.on(
            TrackerHubEvents.UserLeftRoom,
            (trackerConnection: TrackerConnection) => {
                this._userLeftRoomListeners.forEach(callback => callback(trackerConnection));
            }
        )
        this._connection.on(
            TrackerHubEvents.AccessExpired,
            () => {
                this._accessExpiredListeners.forEach(callback => callback());
            }
        )
        this._connection.on(
            TrackerHubEvents.WipNameUpdated,
            (newName: string) => {
                this._wipNameUpdatedListeners.forEach(callback => callback(newName));
            }
        )
        this._connection.on(
            TrackerHubEvents.BpmUpdated,
            (newBpm: number) => {
                this._bpmUpdatedListeners.forEach(callback => callback(newBpm));
            }
        )
        this._connection.on(
            TrackerHubEvents.ChannelCountUpdated,
            (newChannelCount: number) => {
                this._channelCountUpdatedListeners.forEach(callback => callback(newChannelCount));
            }
        )
        this._connection.on(
            TrackerHubEvents.SequencerLengthUpdated,
            (newSequencerLength: number) => {
                this._sequencerLengthUpdatedListeners.forEach(callback => callback(newSequencerLength));
            }
        )
        this._connection.on(
            TrackerHubEvents.SequencerFrameUpdated,
            (command: UpdateSequencerFrameCommand) => {
                this._sequencerFrameUpdatedListeners.forEach(callback => callback(command));
            }
        )
        this._connection.on(
            TrackerHubEvents.SequencerChannelUpdated,
            (command: UpdateSequencerChannelCommand) => {
                this._sequencerChannelUpdatedListeners.forEach(callback => callback(command));
            }
        )
    }

    subscribeChatMessageReceived(callback: (userId: string, message: string) => void): () => boolean {
        this._chatMessageListeners.add(callback);
        return () => this._chatMessageListeners.delete(callback);
    }

    subscribeUserJoinedRoom(callback: (roomMember: RoomMember) => void): () => boolean {
        this._userJoinedRoomListeners.add(callback);
        return () => this._userJoinedRoomListeners.delete(callback);
    }

    subscribeUserLeftRoom(callback: (trackerConnection: TrackerConnection) => void): () => boolean {
        this._userLeftRoomListeners.add(callback);
        return () => this._userLeftRoomListeners.delete(callback);
    }

    subscribeAccessExpired(callback: () => void): () => boolean {
        this._accessExpiredListeners.add(callback);
        return () => this._accessExpiredListeners.delete(callback);
    }

    subscribeWipNameUpdated(callback: (newName: string) => void): () => boolean {
        this._wipNameUpdatedListeners.add(callback);
        return () => this._wipNameUpdatedListeners.delete(callback);
    }

    subscribeBpmUpdated(callback: (newBpm: number) => void): () => boolean {
        this._bpmUpdatedListeners.add(callback);
        return () => this._bpmUpdatedListeners.delete(callback);
    }

    subscribeChannelCountUpdated(callback: (newChannelCount: number) => void): () => boolean {
        this._channelCountUpdatedListeners.add(callback);
        return () => this._channelCountUpdatedListeners.delete(callback);
    }

    subscribeSequencerLengthUpdated(callback: (newSequencerLength: number) => void): () => boolean {
        this._sequencerLengthUpdatedListeners.add(callback);
        return () => this._sequencerLengthUpdatedListeners.delete(callback);
    }

    subscribeSequencerFrameUpdated(callback: (command: UpdateSequencerFrameCommand) => void): () => boolean {
        this._sequencerFrameUpdatedListeners.add(callback);
        return () => this._sequencerFrameUpdatedListeners.delete(callback);
    }

    subscribeSequencerChannelUpdated(callback: (command: UpdateSequencerChannelCommand) => void): () => boolean {
        this._sequencerChannelUpdatedListeners.add(callback);
        return () => this._sequencerChannelUpdatedListeners.delete(callback);
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
        return this.invoke<RoomInitializer, string>(TrackerHubServerFunctions.JoinRoom, roomCode);
    }

    async leaveRoom(): Promise<TrackerHubResult<void>> {
        return this.invoke<void, void>(TrackerHubServerFunctions.LeaveRoom);
    }

    async sendChatMessage(message: string): Promise<TrackerHubResult<void>> {
        return this.invoke<void, string>(TrackerHubServerFunctions.SendChatMessage, message);
    }

    async updateBpm(newBpm: number): Promise<TrackerHubResult<void>> {
        return this.invoke<void, number>(TrackerHubServerFunctions.UpdateBpm, newBpm);
    }

    async updateChannelCount(newChannelCount: number): Promise<TrackerHubResult<void>> {
        return this.invoke<void, number>(TrackerHubServerFunctions.UpdateChannelCount, newChannelCount);
    }

    async updateSequencerLength(newSequencerLength: number): Promise<TrackerHubResult<void>> {
        return this.invoke<void, number>(TrackerHubServerFunctions.UpdateSequencerLength, newSequencerLength);
    }

    async updateSequencerFrame(command: UpdateSequencerFrameCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdateSequencerFrameCommand>(TrackerHubServerFunctions.UpdateSequencerFrame, command);
    }

    async updateSequencerChannel(command: UpdateSequencerChannelCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdateSequencerChannelCommand>(TrackerHubServerFunctions.UpdateSequencerChannel, command);
    }

    private async invoke<TResult, TArg> (trackerHubServerFunction: string, ...args: TArg[]): Promise<TrackerHubResult<TResult>> {
        const result = await this._connection.invoke<TrackerHubResult<TResult>>(trackerHubServerFunction, ...args)
            .catch(() => {
                return this.serverError<TResult>();
            });
        return result;
    }
}