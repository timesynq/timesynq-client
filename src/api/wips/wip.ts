import { ApiError, UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { endpoints } from "../endpoints";

export type Wip = {
    id: string;
    name: string;
    ownerId: string;
    createdOnUTC: Date;
    lastOpenedOnUTC: Date;
}

export type DeleteWipRequest = {
    wipId: string;
}

export type ChangeWipNameRequest = {
    newName: string;
}

export const WipService = {

    create: async (onError?: (description: string) => void): Promise<Wip | null> => {
        try {    
            const response = await fetch(endpoints.wips.create(), {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });
            
            const data = await response.json();

            if(response.ok){
                const trimmedCreatedOnUTCTimestamp = data.createdOnUTC.slice(0, 23);
                const trimmedLastOpenedOnUTCTimestamp = data.lastOpenedOnUTC.slice(0, 23);
                return {
                    ...data,
                    createdOnUTC: new Date(trimmedCreatedOnUTCTimestamp),
                    lastOpenedOnUTC: new Date(trimmedLastOpenedOnUTCTimestamp)
                }
            }
            
            const error = data as ApiError;
            onError && onError(error.detail);
            return null;
        }
        
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    }

}