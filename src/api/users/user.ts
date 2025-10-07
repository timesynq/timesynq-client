import { ApiError, UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { endpoints } from "../endpoints";
import { PagedList } from "../paged-list";

export type User = {
    id: string;
    userName: string;
    profilePicture: number;
    createdOnUTC: Date;
    followerCount: number;
    followeeCount: number;
}

export type Me = User & {
    email: string,
    emailConfirmed: boolean,
}

export type Profile = {
    user: User;
    isFollowing: boolean;
}

export type ChangeUsernameRequest = {
    newUserName: string;
}

export const UserService = {

    me: async (onError?: (description: string) => void): Promise<Me | null> => {
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
        
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
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
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
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
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    },

    search: async (query: string, pageNumber: number = 1, pageSize: number = 20, sortOrder: string, sortBy: string, onError?: (description: string) => void): Promise<PagedList<User> | null> => {
        try {

            const url = new URL(endpoints.users.search(query));
            url.search = new URLSearchParams({
                pageNumber: `${pageNumber}`,
                pageSize: `${pageSize}`,
                sortOrder: `${sortOrder}`,
                sortBy: `${sortBy}`,
            }).toString();

            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: { "Accept": "application/json" },
            });

            const data = await response.json();
            const pagedListFields = {
                items: data.items ?? [],
                pageNumber: data.pageNumber,
                pageSize: data.pageSize,
                totalItems: data.totalItems,
                totalPages: data.totalPages,
                firstPageUrl: data.firstPageUrl ?? null,
                lastPageUrl: data.lastPageUrl ?? null,
                previousPageUrl: data.previousPageUrl ?? null,
                nextPageUrl: data.nextPageUrl ?? null,
                onError: onError,
            }
 
            return new PagedList<User>(pagedListFields);
        } 
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    },

    changeUsername: async (changeUsernameRequest: ChangeUsernameRequest, onSuccess?: (description: string) => void, onError?: (description: string) => void): Promise<boolean> => {
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
                onSuccess && onSuccess("Username changed successfully.");
                return true;
            }
            
            const error = data as ApiError;
            onError && onError(error.detail);
            return false;
        }
        catch (error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return false;
        }
    },
    
    delete: async (onError?: (description: string) => void): Promise<boolean> => {
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
            onError && onError(error.detail);
            return false;
        }
        catch (_error){
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return false;
        }
    }

}
