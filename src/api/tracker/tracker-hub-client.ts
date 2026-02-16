import * as signalR from "@microsoft/signalr";
import { hubs } from "../endpoints";
import { TrackerHubResult } from "./tracker-hub-result";

const TrackerHubServerFunctions = {
    DisbandRoom: "DisbandRoom",
    CreateRoom: "CreateRoom",
    JoinRoom: "JoinRoom",
    LeaveRoom: "LeaveRoom",
}

export class TrackerHubClient{

    private _connection: signalR.HubConnection;
    private _currentRoom: string | null;

    constructor(){
        this._connection = new signalR.HubConnectionBuilder()
            .withUrl(hubs.tracker())
            .withAutomaticReconnect()
            .build();
        this._currentRoom = null;
    }

    private serverError<T>(): TrackerHubResult<T> {
        const result: TrackerHubResult<T> = {
            isSuccessful: false,
            errorMessage: "Unexpected server error. Please try again later",
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

    async createRoom(): Promise<TrackerHubResult<string>> {
        return await this._connection.invoke<TrackerHubResult<string>>(TrackerHubServerFunctions.CreateRoom, null)
            .catch(() => {
                return this.serverError<string>();
            });
    }

    async joinRoom(roomCode: string): Promise<TrackerHubResult<object>> {
        return this.updateRoomState<object>(
            TrackerHubServerFunctions.JoinRoom,
            () => {
                this._currentRoom = roomCode;
            },
            roomCode
        );
    }

    async leaveRoom(): Promise<TrackerHubResult<void>> {
        return this.updateRoomState<void>(
            TrackerHubServerFunctions.LeaveRoom,
            () => {
                this._currentRoom = null;
            }
        );
    }

    async disbandRoom(): Promise<TrackerHubResult<void>> {
        return this.updateRoomState<void>(
            TrackerHubServerFunctions.DisbandRoom,
            () => {
                this._currentRoom = null;
            }
        );
    }

    private async updateRoomState<T> (trackerHubServerFunction: string, callbackIfSuccessful: () => void, ...args: string[]): Promise<TrackerHubResult<T>> {
        const result = await this._connection.invoke<TrackerHubResult<T>>(trackerHubServerFunction, ...args)
            .catch(() => {
                return this.serverError<T>();
            });
        if (result.isSuccessful){
            callbackIfSuccessful();
        }
        return result;
    }
}