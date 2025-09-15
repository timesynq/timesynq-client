import { Profile, User, UserSearchResults } from "@/types/usertypes";
import { ApiError } from "../api-error";
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
                const trimmedTimestamp = data.createdOnUTC.slice(0, 23);
                return {
                    ...data,
                    createdOnUTC: new Date(trimmedTimestamp),
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

    export const User = async (id: string): Promise<User | null> => {
        try {
            const response = await fetch(endpoints.users.getById(id), {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();

            if(response.ok){
                const trimmedTimestamp = data.createdOnUTC.slice(0, 23);
                return {
                    ...data,
                    createdOnUTC: new Date(trimmedTimestamp),
                }
            }
            console.error("Could not fetch user: ", data as ApiError);
            return null;
        }
        catch (error) {
            const apiError: ApiError = {
                type: "FetchError",
                title: "Unexpected error occurred",
                status: 500,
                detail: (error instanceof Error ? error.message : "Unknown error"),
                instance: "User"
            };
            console.error("Caught exception fetching user: ", apiError);
            return null;
        }
    }

    export const Profile = async(id: string): Promise<Profile | null> => {
        try {
            const response = await fetch(endpoints.users.profile(id), {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();

            if(response.ok){
                const user = data.user;
                const trimmedTimestamp = user.createdOnUTC.slice(0, 23);
                user.createdOnUTC = trimmedTimestamp;
                return {
                    ...data,
                    user: user,
                }
            }
            console.error("Could not fetch user profile: ", data as ApiError);
            return null;
        }
        catch (error) {
            const apiError: ApiError = {
                type: "FetchError",
                title: "Unexpected error occurred",
                status: 500,
                detail: (error instanceof Error ? error.message : "Unknown error"),
                instance: "User Profile"
            };
            console.error("Caught exception fetching user profile: ", apiError);
            return null;
        }
    }

    export const UserSearch = async (query: string): Promise<UserSearchResults | null> => {

        try{
            const response = await fetch(endpoints.users.search(query), {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'text/plain',
                },
            });

            const data = await response.json();

            if(response.ok){
                console.log(data);
                return {
                    ...data,
                }
            }
            console.error("Could not fetch user: ", data as ApiError);
            return null;

        }
        catch (error) {
            const apiError: ApiError = {
                type: "FetchError",
                title: "Unexpected error occurred",
                status: 500,
                detail: (error instanceof Error ? error.message : "Unknown error"),
                instance: "User"
            };
            console.error("Caught exception fetching user: ", apiError);
            return null;
        }
    }

    export const Profile = async(id: string): Promise<Profile | null> => {
        try {
            const response = await fetch(endpoints.users.profile(id), {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();

            if(response.ok){
                const user = data.user;
                const trimmedTimestamp = user.createdOnUTC.slice(0, 23);
                user.createdOnUTC = trimmedTimestamp;
                return {
                    ...data,
                    user: user,
                }
            }
            console.error("Could not fetch user profile: ", data as ApiError);
            return null;
        }
        catch (error) {
            const apiError: ApiError = {
                type: "FetchError",
                title: "Unexpected error occurred",
                status: 500,
                detail: (error instanceof Error ? error.message : "Unknown error"),
                instance: "User Profile"
            };
            console.error("Caught exception fetching user profile: ", apiError);
            return null;
        }

    }

    export const UserSearch = async (query: string): Promise<UserSearchResults | null> => {

        try{
            const response = await fetch(endpoints.users.search(query), {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'text/plain',
                },
            });

            const data = await response.json();

            if(response.ok){
                console.log(data);
                return {
                    ...data,
                }
            }
            console.error("Could not fetch user: ", data as ApiError);
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