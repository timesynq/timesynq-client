import { endpoints } from "../endpoints";
import { ApiError, UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { trimUTC } from "@/utils/date";
import { Result } from "../result";

export type Follow = {
    followerId: string;
    followeeId: string;
    createdOnUTC: Date;
}

export type FollowRequest = {
    followeeId: string
}

export const FollowService = {

    follow: async (followRequest: FollowRequest): Promise<Result<Follow>> => {
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
                    isSuccessful: true,
                    value: {
                        ...data,
                        createdOnUTC: trimUTC(data.createdOnUTC),
                    }
                }
            }
            
            const error = data as ApiError;
            return {
                isSuccessful: false,
                message: error.detail,
            };
        }
        
        catch (_error) {
            return {
                isSuccessful: false,
                message: UNEXPECTED_ERROR_MESSAGE,
            };
        }
    },

    unfollow: async (followeeId: string): Promise<Result<void>> => {
        try {
            const response = await fetch(endpoints.follow.unfollow(followeeId), {
                method: "DELETE",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });

            if(response.ok){
                return {
                    isSuccessful: true,
                    value: undefined
                };
            }
            const data = await response.json();
            const error = data as ApiError;
            return {
                isSuccessful: false,
                message: error.detail,
            };
        }
        
        catch (_error) {
            return {
                isSuccessful: false,
                message: UNEXPECTED_ERROR_MESSAGE,
            };
        }
    }

}