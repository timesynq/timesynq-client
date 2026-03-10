import { trimUTC } from "@/utils/date";
import { ApiError, UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { endpoints } from "../endpoints";
import { PagedList, PagedListFields } from "../paged-list";
import { Result, ResultFactory } from "../result";

export const UserSortField = {
    username: "username",
    accountAge: "accountage",
    followers: "followers",
}

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

    me: async (): Promise<Result<Me>> => {
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
                return ResultFactory.success<Me>({
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

    user: async (id: string): Promise<Result<User>> => {
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
                return ResultFactory.success<User>({
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

    profile: async(id: string): Promise<Result<Profile>> => {
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
                user.createdOnUTC = trimUTC(user.createdOnUTC);
                return ResultFactory.success<Profile>({
                    ...data,
                    user: user,
                });
            }

            const error = data as ApiError;
            return ResultFactory.error(error.detail);
        }
        catch (_error) {
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    },

    search: async (
        searchString: string | null = null,
        pageNumber: number = 1,
        pageSize: number = 20,
        sortOrder: string,
        sortBy: string, 
        onError?: (description: string) => void
    ): Promise<PagedList<User> | null> => {
        try {
            const url = new URL(endpoints.users.search());
            url.search = new URLSearchParams({
                ...(searchString !== null && {searchString}),
                pageNumber: `${pageNumber}`,
                pageSize: `${pageSize}`,
                sortOrder: sortOrder,
                sortBy: sortBy,
            }).toString();

            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: { "Accept": "application/json" },
            });

            const data = await response.json();
            const pagedListFields: PagedListFields<User> = {
                items: data.items ?? [],
                pageNumber: data.pageNumber,
                pageSize: data.pageSize,
                totalItems: data.totalItems,
                totalPages: data.totalPages,
                firstPageUrl: data.firstPageUrl ?? null,
                lastPageUrl: data.lastPageUrl ?? null,
                previousPageUrl: data.previousPageUrl ?? null,
                nextPageUrl: data.nextPageUrl ?? null,
            }
 
            return new PagedList<User>(pagedListFields);
        } 
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    },

    changeUsername: async (changeUsernameRequest: ChangeUsernameRequest): Promise<Result<void>> => {
        try{
            const response = await fetch(endpoints.users.changeUsername(), {
                method: "PATCH",
                credentials: "include",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(changeUsernameRequest),
            });

            const data = await response.json();
            if(response.ok){
                return ResultFactory.success<void>(undefined);
            }
            
            const error = data as ApiError;
            return ResultFactory.error(error.detail);
        }
        catch (_error) {
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    },
    
    delete: async (): Promise<Result<void>> => {
        try{
            const response = await fetch(endpoints.users.delete(), {
                method: "DELETE",
                credentials: "include",
                headers: {
                    'Accept': 'application/json',
                },
            });

            if(response.ok){
                return ResultFactory.success<void>(undefined);
            }

            const data = await response.json();
            const error = data as ApiError;
            return ResultFactory.error(error.detail);
        }
        catch (_error){
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    }

}
