import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { useAuth } from "./auth-provider";

interface TrackerHubProviderState {
    createRoom: () => Promise<string | null>
    joinRoom: (roomCode: string) => Promise<void>
    leaveRoom: () => Promise<void>
}

interface TrackerHubProviderProps {
    children: React.ReactNode;
}

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

    const createRoom = useCallback(async (): Promise<string | null> => {
        if(trackerHubClientRef.current === null)
            return null;
        return await trackerHubClientRef.current.createRoom();
    }, []);

    const joinRoom = useCallback(async (roomCode: string): Promise<void> => {
        if(trackerHubClientRef.current === null)
            return;
        await trackerHubClientRef.current.joinRoom(roomCode);
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