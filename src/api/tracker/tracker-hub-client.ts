import * as signalR from "@microsoft/signalr";
import { hubs } from "../endpoints";
import { TrackerHubResult } from "./tracker-hub-result";
import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { Wip } from "../wips/wip";

const TrackerHubServerFunctions = {
    JoinRoom: "JoinRoom",
    LeaveRoom: "LeaveRoom",
}

export class TrackerHubClient{

    private _connection: signalR.HubConnection;

    constructor(){
        this._connection = new signalR.HubConnectionBuilder()
            .withUrl(hubs.tracker())
            .withAutomaticReconnect()
            .build();
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
}