import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { useAuth } from "./auth-provider";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-result";

interface TrackerHubProviderState {
    createRoom: () => Promise<TrackerHubResult<string>>
    joinRoom: (roomCode: string) => Promise<TrackerHubResult<object>>
    leaveRoom: () => Promise<void>
}

interface TrackerHubProviderProps {
    children: React.ReactNode;
}

const NO_CONNECTION_ERROR_MESSAGE: string = "Unable to connect to the server. Try refreshing the page.";

const TrackerHubProviderContext = createContext<TrackerHubProviderState | undefined>(undefined);

export const TrackerHubProvider = ({children}: TrackerHubProviderProps) => {

    const { user } = useAuth();
    const trackerHubClientRef = useRef<TrackerHubClient | null>(null);

    useEffect(() => {
        const setupTrackerHubClient = async (): Promise<void> => {
            if(!user){
                if(trackerHubClientRef.current !== null){
                    trackerHubClientRef.current.stop();
                    trackerHubClientRef.current = null;
                }
                return;
            }
            if (trackerHubClientRef.current !== null)
                return;
            const client = new TrackerHubClient();
            await client.start();
            trackerHubClientRef.current = client;
        };
        setupTrackerHubClient();
    }, [user]);

    const createRoom = useCallback(async (): Promise<TrackerHubResult<string>> => {
        if(trackerHubClientRef.current === null){
            const errorResult: TrackerHubResult<string> = {
                isSuccessful: false,
                errorMessage: NO_CONNECTION_ERROR_MESSAGE,
                value: null
            }
            return errorResult;
        }
        return await trackerHubClientRef.current.createRoom();
    }, []);

    const joinRoom = useCallback(async (roomCode: string): Promise<TrackerHubResult<object>> => {
        if(trackerHubClientRef.current === null){
            const errorResult: TrackerHubResult<object> = {
                isSuccessful: false,
                errorMessage: NO_CONNECTION_ERROR_MESSAGE,
                value: null
            }
            return errorResult;
        }
        return await trackerHubClientRef.current.joinRoom(roomCode);
    }, []);

    const leaveRoom = useCallback(async (): Promise<void> => {
        if(trackerHubClientRef.current === null)
            return;
        await trackerHubClientRef.current.leaveRoom();
    }, []);

    return(
        <TrackerHubProviderContext.Provider value={{createRoom, joinRoom, leaveRoom}}>
            {children}
        </TrackerHubProviderContext.Provider>
    ) 
}

export const useTrackerHub = () => {
    const context = useContext(TrackerHubProviderContext);
    if(context === undefined){
        throw new Error('useTrackerHub must be used within a TrackerHubProvider');
    }
    return context;
}