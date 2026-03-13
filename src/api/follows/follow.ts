import { endpoints } from "../endpoints";
import { ApiError, UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { trimUTC } from "@/utils/date";
import { Result, ResultFactory } from "../result";

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
                return ResultFactory.success<Follow>({
                    ...data,
                    createdOnUTC: trimUTC(data.createdOnUTC),
                });
            }
            
            const error = data as ApiError;
            return ResultFactory.error(error.detail);
        }
        
        catch (_error) {
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
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
                return ResultFactory.success<void>(undefined);
            }
            const data = await response.json();
            const error = data as ApiError;
            return ResultFactory.error(error.detail);
        }
        
        catch (_error) {
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    }

}