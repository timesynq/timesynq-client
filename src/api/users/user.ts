import { ApiError, ApiErrorFactory } from "../api-error";
import { endpoints } from "../endpoints";

export type User = {
    id: string;
    userName: string;
    profilePicture: number;
    createdOnUTC: Date;
    followerCount: number;
    followeeCount: number;
}

export type Profile = {
    user: User;
    isFollowing: boolean;
}

export type UserSearchResults = {
    items: { user: User; }[];
}

export type ChangeUsernameRequest = {
    newUserName: string;
}

export const UserService = {

    me: async (onError?: (description: string) => void): Promise<User | null> => {
        try {    
            const response = await fetch(endpoints.users.me(), {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
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

            return null;
        }
        
        catch (error) {
            const apiError: ApiError = ApiErrorFactory.createFetchError(error, "me");
            onError && onError(apiError.detail);
            return null;
        }
    },

    user: async (id: string, onError?: (description: string) => void): Promise<User | null> => {
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

            return null;
        }
        catch (error) {
            const apiError: ApiError = ApiErrorFactory.createFetchError(error, "user");
            onError && onError(apiError.detail);
            return null;
        }
    },

    profile: async(id: string, onError?: (description: string) => void): Promise<Profile | null> => {
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

            return null;
        }
        catch (error) {
            const apiError: ApiError = ApiErrorFactory.createFetchError(error, "profile");
            onError && onError(apiError.detail);
            return null;
        }
    },

    search: async (query: string, onError?: (description: string) => void): Promise<UserSearchResults | null> => {
        try {
            const response = await fetch(endpoints.users.search(query), {
                method: "GET",
                credentials: "include",
                headers: { "Accept": "application/json" },
            });

            const data = await response.json();
            const userResults: UserSearchResults = {
                items: data.items
                    ? data.items.map((item: User) => ({
                        user: item,
                    }))
                    : [],
            };

            return userResults ?? null;

        } 
        catch (error) {
            const apiError: ApiError = ApiErrorFactory.createFetchError(error, "search");
            onError && onError(apiError.detail);
            return null;
        }
    },

    changeUsername: async (changeUsernameRequest: ChangeUsernameRequest, onSuccess: (description: string) => void, onError: (description: string) => void): Promise<boolean> => {
        try{
            const response = await fetch(endpoints.users.changeUsername(), {
                method: "POST",
                credentials: "include",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(changeUsernameRequest),
            });

            const data = await response.json();
            if(response.ok){
                onSuccess("Username changed successfully.");
                return true;
            }
            
            const error = data as ApiError;
            onError(error.detail);
            return false;
        }
        catch (error) {
            const apiError: ApiError = ApiErrorFactory.createFetchError(error, "changeUsername");
            onError(apiError.detail);
            return false;
        }
    },
    
    delete: async (onError: (description: string) => void): Promise<boolean> => {
        try{
            const response = await fetch(endpoints.users.delete(), {
                method: "DELETE",
                credentials: "include",
                headers: {
                    'Accept': 'application/json',
                },
            });

            if(response.ok){
                return true;
            }

            const data = await response.json();
            const error = data as ApiError;
            onError(error.detail);
            return false;
        }
        catch (error){
            const apiError: ApiError = ApiErrorFactory.createFetchError(error, "changeUsername");
            onError(apiError.detail);
            return false;
        }
    }

}
