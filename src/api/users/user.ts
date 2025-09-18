import { ApiError } from "../api-error";
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

export const UserService = {

    me: async (): Promise<User | null> => {
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
    },

    user: async (id: string): Promise<User | null> => {
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
    },

    profile: async(id: string): Promise<Profile | null> => {
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
    },

    search: async (query: string): Promise<UserSearchResults | null> => {
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

        } catch (error) {
            console.error("UserSearch fetch failed:", error);
            return null;
        }
    }

}
