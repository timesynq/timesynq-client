import { Follow } from "@/types/follow-types";
import { endpoints } from "../endpoints";
import { ApiError } from "../api-error";

export type FollowRequest = {
    followeeId: string
}

export type UnfollowRequest = FollowRequest;

export namespace FollowApi {

    export const Follow = async (followRequest: FollowRequest, onError: (description: string) => void): Promise<Follow | null> => {
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
            onError(error.detail);
            console.error("Could not follow user: ", error);
            return null;
        }
        
        catch (error) {
            const apiError: ApiError = {
                type: "FetchError",
                title: "Unexpected error occurred",
                status: 500,
                detail: (error instanceof Error ? error.message : "Unknown error"),
                instance: "Follow"
            };
            onError(apiError.detail);
            console.error("Caught exception following user: ", apiError);
            return null;
        }
    }

    export const Unfollow = async (unfollowRequest: UnfollowRequest, onError: (description: string) => void): Promise<boolean> => {
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
            onError(error.detail);
            console.error("Could not unfollow user: ", error);
            return false;
        }
        
        catch (error) {
            const apiError: ApiError = {
                type: "FetchError",
                title: "Unexpected error occurred",
                status: 500,
                detail: (error instanceof Error ? error.message : "Unknown error"),
                instance: "Unfollow"
            };
            onError(apiError.detail);
            console.error("Caught exception unfollowing user: ", apiError);
            return false;
        }
    }

}