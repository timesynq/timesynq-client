import * as signalR from "@microsoft/signalr";
import { hubs } from "../endpoints";
import { TrackerHubResult } from "./tracker-hub-result";

const TrackerHubServerFunctions = {
    DisbandRoom: "DisbandRoom",
    CreateRoom: "CreateRoom",
    JoinRoom: "JoinRoom",
}

export class TrackerHubClient{

    private _connection: signalR.HubConnection;

    constructor(){
        this._connection = new signalR.HubConnectionBuilder()
            .withUrl(hubs.tracker())
            .withAutomaticReconnect()
            .build();
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

    createRoom(): Promise<TrackerHubResult<string>> {
        return this._connection.invoke<TrackerHubResult<string>>(TrackerHubServerFunctions.CreateRoom, null);
    }

    joinRoom(roomCode: string): Promise<TrackerHubResult<object>> {
        return this._connection.invoke<TrackerHubResult<object>>(TrackerHubServerFunctions.JoinRoom, roomCode);
    }

    async leaveRoom(): Promise<void> {
        
    }


}