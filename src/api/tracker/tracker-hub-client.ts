import * as signalR from "@microsoft/signalr";
import { hubs } from "../endpoints";

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

    createRoom(): Promise<string | null> {
        return this._connection.invoke<string | null>(TrackerHubServerFunctions.CreateRoom, null);
    }

    async joinRoom(roomCode: string): Promise<void> {

        //in the future, JoinRoom will return the tracker info needed to initialize the page when successful
        await this._connection.invoke(TrackerHubServerFunctions.JoinRoom, roomCode)
            .catch((error) => {
                if(import.meta.env.DEV) console.error(error);
            });
    }

    async leaveRoom(): Promise<void> {
        
    }


}