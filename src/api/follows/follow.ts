import { endpoints } from "../endpoints";
import { ApiError, UNEXPECTED_ERROR_MESSAGE } from "../api-error";

export type Follow = {
    followerId: string;
    followeeId: string;
    createdOnUTC: Date;
}

export type FollowRequest = {
    followeeId: string
}

export type UnfollowRequest = FollowRequest;

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
                const trimmedTimestamp = data.createdOnUTC.slice(0, 23);
                return {
                    ...data,
                    createdOnUTC: new Date(trimmedTimestamp),
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

    unfollow: async (unfollowRequest: UnfollowRequest, onError?: (description: string) => void): Promise<boolean> => {
        try {    
            const response = await fetch(endpoints.follow.unfollow(), {
                method: "DELETE",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(unfollowRequest),
            });
            
            if(response.ok){
                return true;
            }
            const data = await response.json();
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