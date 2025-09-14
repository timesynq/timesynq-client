import { User } from "@/types/usertypes";
import { ApiError } from "../apierror";
import { endpoints } from "../endpoints";

export namespace UserApi {

    export const Me = async (): Promise<User | null> => {
        try {    
            const response = await fetch(endpoints.users.me(), {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });
            
            const data = await response.json();

            if(response.ok){
                return {
                    ...data,
                    createdOnUtc: new Date(data.createdOnUtc),
                }
            }
            console.error("Could not fetch me: ", data as ApiError);
            return null;
            
        }
        
        catch (error) {
            const apiError: ApiError = {
                type: "FetchError",
                title: "Unexpected error occurred",
                status: 500,
                detail: (error instanceof Error ? error.message : "Unknown error"),
                instance: "Me"
            };
            console.error("Caught exception fetching me: ", apiError);
            return null;
        }
    }

}