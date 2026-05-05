import * as signalR from "@microsoft/signalr";
import { hubs } from "../endpoints";
import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { ChatMessage, RoomInitializer, RoomMember, TrackerConnection, TrackerHubResult } from "./tracker-hub-models";
import { UpdateChannelMuteCommand, UpdateChannelSoloCommand, UpdateChannelTypeCommand, UpdateFXSymbolCommand, UpdateFXValueCommand, UpdateInstrumentCommand, UpdateLineCountCommand, UpdateLinesPerBeatCommand, UpdatePitchCommand, UpdateSequencerChannelCommand, UpdateSequencerFrameCommand } from "./tracker-hub-commands";

const TrackerHubServerFunctions = {
    JoinRoom: "JoinRoom",
    LeaveRoom: "LeaveRoom",
    SendChatMessage: "SendChatMessage",
    UpdateBpm: "UpdateBpm",
    UpdateChannelCount: "UpdateChannelCount",
    UpdateSequencerLength: "UpdateSequencerLength",
    UpdateSequencerFrame: "UpdateSequencerFrame",
    UpdateSequencerChannel: "UpdateSequencerChannel",
    UpdateLineCount: "UpdateLineCount",
    UpdateLinesPerBeat: "UpdateLinesPerBeat",
    UpdateChannelType: "UpdateChannelType",
    UpdateChannelMute: "UpdateChannelMute",
    UpdateChannelSolo: "UpdateChannelSolo",
    UpdatePitch: "UpdatePitch",
    UpdateInstrument: "UpdateInstrument",
    UpdateFXSymbol: "UpdateFXSymbol",
    UpdateFXValue: "UpdateFXValue",
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
    LineCountUpdated: "LineCountUpdated",
    LinesPerBeatUpdated: "LinesPerBeatUpdated",
    ChannelTypeUpdated: "ChannelTypeUpdated",
    ChannelMuteUpdated: "ChannelMuteUpdated",
    ChannelSoloUpdated: "ChannelSoloUpdated",
    PitchUpdated: "PitchUpdated",
    InstrumentUpdated: "InstrumentUpdated",
    FXSymbolUpdated: "FXSymbolUpdated",
    FXValueUpdated: "FXValueUpdated",
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
    private _lineCountUpdatedListeners: Set<(command: UpdateLineCountCommand) => void>;
    private _linesPerBeatUpdatedListeners: Set<(command: UpdateLinesPerBeatCommand) => void>;
    private _channelTypeUpdatedListeners: Set<(comamnd: UpdateChannelTypeCommand) => void>;
    private _channelMuteUpdatedListeners: Set<(command: UpdateChannelMuteCommand) => void>;
    private _channelSoloUpdatedListeners: Set<(command: UpdateChannelSoloCommand) => void>;
    private _pitchUpdatedListeners: Set<(command: UpdatePitchCommand) => void>;
    private _instrumentUpdatedListeners: Set<(command: UpdateInstrumentCommand) => void>;
    private _fxSymbolUpdatedListeners: Set<(command: UpdateFXSymbolCommand) => void>;
    private _fxValueUpdatedListeners: Set<(command: UpdateFXValueCommand) => void>;

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
        this._lineCountUpdatedListeners = new Set<(command: UpdateLineCountCommand) => void>();
        this._linesPerBeatUpdatedListeners = new Set<(command: UpdateLinesPerBeatCommand) => void>();
        this._channelTypeUpdatedListeners = new Set<(command: UpdateChannelTypeCommand) => void>();
        this._channelMuteUpdatedListeners = new Set<(command: UpdateChannelMuteCommand) => void>();
        this._channelSoloUpdatedListeners = new Set<(command: UpdateChannelSoloCommand) => void>();
        this._pitchUpdatedListeners = new Set<(command: UpdatePitchCommand) => void>();
        this._instrumentUpdatedListeners = new Set<(command: UpdateInstrumentCommand) => void>();
        this._fxSymbolUpdatedListeners = new Set<(command: UpdateFXSymbolCommand) => void>();
        this._fxValueUpdatedListeners = new Set<(command: UpdateFXValueCommand) => void>();
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
        register(TrackerHubEvents.LineCountUpdated, this._lineCountUpdatedListeners);
        register(TrackerHubEvents.LinesPerBeatUpdated, this._linesPerBeatUpdatedListeners);
        register(TrackerHubEvents.ChannelTypeUpdated, this._channelTypeUpdatedListeners);
        register(TrackerHubEvents.ChannelMuteUpdated, this._channelMuteUpdatedListeners);
        register(TrackerHubEvents.ChannelSoloUpdated, this._channelSoloUpdatedListeners);
        register(TrackerHubEvents.PitchUpdated, this._pitchUpdatedListeners);
        register(TrackerHubEvents.InstrumentUpdated, this._instrumentUpdatedListeners);
        register(TrackerHubEvents.FXSymbolUpdated, this._fxSymbolUpdatedListeners);
        register(TrackerHubEvents.FXValueUpdated, this._fxValueUpdatedListeners);
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

    subscribeLineCountUpdated(callback: (command: UpdateLineCountCommand) => void): () => boolean {
        return this.subscribe(this._lineCountUpdatedListeners, callback);
    }

    subscribeLinesPerBeatUpdated(callback: (command: UpdateLinesPerBeatCommand) => void): () => boolean {
        return this.subscribe(this._linesPerBeatUpdatedListeners, callback);
    }

    subscribeChannelTypeUpdated(callback: (command: UpdateChannelTypeCommand) => void): () => boolean {
        return this.subscribe(this._channelTypeUpdatedListeners, callback);
    }

    subscribeChannelMuteUpdated(callback: (command: UpdateChannelMuteCommand) => void): () => boolean {
        return this.subscribe(this._channelMuteUpdatedListeners, callback);
    }

    subscribeChannelSoloUpdated(callback: (command: UpdateChannelSoloCommand) => void): () => boolean {
        return this.subscribe(this._channelSoloUpdatedListeners, callback);
    }

    subscribePitchUpdated(callback: (command: UpdatePitchCommand) => void): () => boolean {
        return this.subscribe(this._pitchUpdatedListeners, callback);
    }

    subscribeInstrumentUpdated(callback: (command: UpdateInstrumentCommand) => void): () => boolean {
        return this.subscribe(this._instrumentUpdatedListeners, callback);
    }

    subscribeFXSymbolUpdated(callback: (command: UpdateFXSymbolCommand) => void): () => boolean {
        return this.subscribe(this._fxSymbolUpdatedListeners, callback);
    }

    subscribeFXValueUpdated(callback: (command: UpdateFXValueCommand) => void): () => boolean {
        return this.subscribe(this._fxValueUpdatedListeners, callback);
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

    async updateLineCount(command: UpdateLineCountCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdateLineCountCommand>(TrackerHubServerFunctions.UpdateLineCount, command);
    }

    async updateLinesPerBeat(command: UpdateLinesPerBeatCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdateLinesPerBeatCommand>(TrackerHubServerFunctions.UpdateLinesPerBeat, command);
    }

    async updateChannelType(command: UpdateChannelTypeCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdateChannelTypeCommand>(TrackerHubServerFunctions.UpdateChannelType, command);
    }

    async updateChannelMute(command: UpdateChannelMuteCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdateChannelMuteCommand>(TrackerHubServerFunctions.UpdateChannelMute, command);
    }

    async updateChannelSolo(command: UpdateChannelSoloCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdateChannelSoloCommand>(TrackerHubServerFunctions.UpdateChannelSolo, command);
    }

    async updatePitch(command: UpdatePitchCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdatePitchCommand>(TrackerHubServerFunctions.UpdatePitch, command);
    }

    async updateInstrument(command: UpdateInstrumentCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdateInstrumentCommand>(TrackerHubServerFunctions.UpdateInstrument, command);
    }

    async updateFXSymbol(command: UpdateFXSymbolCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdateFXSymbolCommand>(TrackerHubServerFunctions.UpdateFXSymbol, command);
    }

    async updateFXValue(command: UpdateFXValueCommand): Promise<TrackerHubResult<void>> {
        return this.invoke<void, UpdateFXValueCommand>(TrackerHubServerFunctions.UpdateFXValue, command);
    }

    private async invoke<TResult, TArg> (trackerHubServerFunction: string, ...args: TArg[]): Promise<TrackerHubResult<TResult>> {
        const result = await this._connection.invoke<TrackerHubResult<TResult>>(trackerHubServerFunction, ...args)
            .catch(() => {
                return this.serverError<TResult>();
            });
        return result;
    }
}