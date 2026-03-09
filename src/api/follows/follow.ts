import { endpoints } from "../endpoints";
import { ApiError, UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { trimUTC } from "@/utils/date";

export type Follow = {
    followerId: string;
    followeeId: string;
    createdOnUTC: Date;
}

export type FollowRequest = {
    followeeId: string
}

export const FollowService = {

    follow: async (followRequest: FollowRequest, onError?: (description: string) => void): Promise<Follow | null> => {
        try {    
            const response = await fetch(endpoints.follow.follow(), {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(followRequest),
            });
            
            const data = await response.json();

            if(response.ok){
                return {
                    ...data,
                    createdOnUTC: trimUTC(data.createdOnUTC),
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
    },

    unfollow: async (followeeId: string, onError?: (description: string) => void): Promise<boolean> => {
        console.log(followeeId)

        try {    
            const response = await fetch(endpoints.follow.unfollow(followeeId), {
                method: "DELETE",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });

            console.log(endpoints.follow.unfollow(followeeId))
            
            if(response.ok){
                return true;
            }
            const data = await response.json();
            console.log(data)
            const error = data as ApiError;
            onError && onError(error.detail);
            return false;
        }
        
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return false;
        }
    }

}