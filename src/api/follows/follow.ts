import { Follow } from "@/types/follow-types";
import { endpoints } from "../endpoints";
import { ApiError } from "../api-error";

export type FollowRequest = {
    followeeId: string
}

export type UnfollowRequest = FollowRequest;

export namespace FollowApi {

    export const Follow = async (followRequest: FollowRequest): Promise<Follow | null> => {
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
            console.error("Could not follow user: ", data as ApiError);
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
            console.error("Caught exception following user: ", apiError);
            return null;
        }
    }

    export const Unfollow = async (unfollowRequest: UnfollowRequest): Promise<boolean> => {
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
            console.error("Could not unfollow user: ", data as ApiError);
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
            console.error("Caught exception unfollowing user: ", apiError);
            return false;
        }
    }

}