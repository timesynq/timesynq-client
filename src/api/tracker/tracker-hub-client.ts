import * as signalR from "@microsoft/signalr";
import { hubs } from "../endpoints";
import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { ChatMessage, RoomInitializer, RoomMember, TrackerConnection, TrackerHubResult } from "./tracker-hub-models";
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
    private _chatMessageListeners: Set<(chatMessage: ChatMessage) => void>;
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

        this._chatMessageListeners = new Set<(chatMessage: ChatMessage) => void>();
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

        const register = <T>(event: string, listeners: Set<(arg: T) => void>): void => {
            this._connection.on(
                event,
                (arg: T) => listeners.forEach(cb => cb(arg))
            );
        }

        register(TrackerHubEvents.MessageAddedToChat, this._chatMessageListeners);
        register(TrackerHubEvents.UserJoinedRoom, this._userJoinedRoomListeners);
        register(TrackerHubEvents.UserLeftRoom, this._userLeftRoomListeners);
        register(TrackerHubEvents.AccessExpired, this._accessExpiredListeners);
        register(TrackerHubEvents.WipNameUpdated, this._wipNameUpdatedListeners);
        register(TrackerHubEvents.BpmUpdated, this._bpmUpdatedListeners);
        register(TrackerHubEvents.ChannelCountUpdated, this._channelCountUpdatedListeners);
        register(TrackerHubEvents.SequencerLengthUpdated, this._sequencerLengthUpdatedListeners);
        register(TrackerHubEvents.SequencerFrameUpdated, this._sequencerFrameUpdatedListeners);
        register(TrackerHubEvents.SequencerChannelUpdated, this._sequencerChannelUpdatedListeners);
    }

    private subscribe<T>(
        listeners: Set<(arg: T) => void>,
        callback: (arg: T) => void
    ): () => boolean {
        listeners.add(callback);
        return () => listeners.delete(callback);        
    }

    subscribeChatMessageReceived(callback: (chatMessage: ChatMessage) => void): () => boolean {
        return this.subscribe(this._chatMessageListeners, callback);
    }

    subscribeUserJoinedRoom(callback: (roomMember: RoomMember) => void): () => boolean {
        return this.subscribe(this._userJoinedRoomListeners, callback);
    }

    subscribeUserLeftRoom(callback: (trackerConnection: TrackerConnection) => void): () => boolean {
        return this.subscribe(this._userLeftRoomListeners, callback);
    }

    subscribeAccessExpired(callback: () => void): () => boolean {
        return this.subscribe(this._accessExpiredListeners, callback);
    }

    subscribeWipNameUpdated(callback: (newName: string) => void): () => boolean {
        return this.subscribe(this._wipNameUpdatedListeners, callback);
    }

    subscribeBpmUpdated(callback: (newBpm: number) => void): () => boolean {
        return this.subscribe(this._bpmUpdatedListeners, callback);
    }

    subscribeChannelCountUpdated(callback: (newChannelCount: number) => void): () => boolean {
        return this.subscribe(this._channelCountUpdatedListeners, callback);
    }

    subscribeSequencerLengthUpdated(callback: (newSequencerLength: number) => void): () => boolean {
        return this.subscribe(this._sequencerLengthUpdatedListeners, callback);
    }

    subscribeSequencerFrameUpdated(callback: (command: UpdateSequencerFrameCommand) => void): () => boolean {
        return this.subscribe(this._sequencerFrameUpdatedListeners, callback);
    }

    subscribeSequencerChannelUpdated(callback: (command: UpdateSequencerChannelCommand) => void): () => boolean {
        return this.subscribe(this._sequencerChannelUpdatedListeners, callback);
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