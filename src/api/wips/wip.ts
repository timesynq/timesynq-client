import { trimUTC } from "@/utils/date";
import { ApiError, UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { endpoints } from "../endpoints";
import { PagedList } from "../paged-list";
import { User } from "../users/user";

export const WipSortField = {
    name: "name",
    lastOpened: "lastopened",
    wipage: "wipage",
}

export const WipShareSortField = {
    name: "name",
    shareAge: "shareAge"
}

export type Wip = {
    id: string;
    name: string;
    ownerId: string;
    createdOnUTC: Date;
    lastOpenedOnUTC: Date;
}

export type ChangeWipNameRequest = {
    newName: string;
}

export type ShareWipRequest = {
    shareWithId: string
}

export const WipService = {

    getMyWips: async (
        searchString: string | null = null,
        pageNumber: number = 1,
        pageSize: number = 20,
        sortOrder: string,
        sortBy: string,
        onError?: (description: string) => void
    ): Promise<PagedList<Wip> | null> => {
        try {
            const url = new URL(endpoints.wips.getMyWips());
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

            const items: Wip[] = (data.items ?? []).map((item: any) => {
                return {
                    ...item,
                    createdOnUTC: item.createdOnUTC
                        ? trimUTC(item.createdOnUTC)
                        : null,
                    lastOpenedOnUTC: item.lastOpenedOnUTC
                        ? trimUTC(item.lastOpenedOnUTC)
                        : null,
                };
            });
            
            const pagedListFields = {
                items: items,
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
    
            return new PagedList<Wip>(pagedListFields);
        } 
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    },

    create: async (onError?: (description: string) => void): Promise<Wip | null> => {
        try {    
            const response = await fetch(endpoints.wips.create(), {
                method: "POST",
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
                    createdOnUTC: trimUTC(data.createdOnUTC),
                    lastOpenedOnUTC: trimUTC(data.lastOpenedOnUTC)
                }
            }
            
            const error = data as ApiError;
            onError && onError(error.detail);
            return null;
        }
        
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    },

    changeWipName: async (changeWipNameRequest: ChangeWipNameRequest, onSuccess?: (description: string) => void, onError?: (description: string) => void): Promise<boolean> => {
        try{
            const response = await fetch(endpoints.wips.changeWipName(changeWipNameRequest.newName), {
                method: "POST",
                credentials: "include",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(changeWipNameRequest),
            });

            const data = await response.json();
            if(response.ok){
                onSuccess && onSuccess("Wip name changed successfully.");
                return true;
            }
            
            const error = data as ApiError;
            onError && onError(error.detail);
            return false;
        }
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return false;
        }
    },

    delete: async (wipId: string, onError?: (description: string) => void): Promise<boolean> => {
        try{
            const response = await fetch(endpoints.wips.delete(wipId), {
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
    },

    getWipsSharedWithMe: async (
        searchString: string | null = null,
        pageNumber: number = 1,
        pageSize: number = 20,
        sortOrder: string,
        sortBy: string,
        onError?: (description: string) => void
    ): Promise<PagedList<Wip> | null> => {
        try {
            const url = new URL(endpoints.wips.getSharedWips());
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

            const items: Wip[] = (data.items ?? []).map((item: any) => {
                return {
                    ...item,
                    createdOnUTC: item.createdOnUTC
                        ? trimUTC(item.createdOnUTC)
                        : null,
                    lastOpenedOnUTC: item.lastOpenedOnUTC
                        ? trimUTC(item.lastOpenedOnUTC)
                        : null,
                };
            });

            const pagedListFields = {
                items: items,
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
    
            return new PagedList<Wip>(pagedListFields);
        } 
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    },

    getSharedUsers: async (
        wipId: string,
        pageNumber: number = 1,
        pageSize: number = 20,
        sortOrder: string,
        sortBy: string,
        onError?: (description: string) => void
    ): Promise<PagedList<Wip> | null> => {
        try {
            const url = new URL(endpoints.wips.getSharedUsers(wipId));
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
    
            return new PagedList<Wip>(pagedListFields);
        } 
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    },

    share: async (
        wipId: string,
        shareWipRequest: ShareWipRequest,
        onSuccess?: (description: string) => void,
        onError?: (description: string) => void
    ): Promise<User | null> => {
        try{
            const response = await fetch(endpoints.wips.share(wipId), {
                method: "POST",
                credentials: "include",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shareWipRequest),
            });

            const data = await response.json();
            if(response.ok){
                onSuccess && onSuccess("Wip shared successfully.");
                return data as User;
            }
            
            const error = data as ApiError;
            onError && onError(error.detail);
            return null;
        }
        catch (_error) {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    },

    unshareOne: async (
        wipId: string,
        userId: string,
        onSuccess?: (description: string) => void,
        onError?: (description: string) => void
    ): Promise<boolean> => {
        try{
            const response = await fetch(endpoints.wips.unshareOne(wipId, userId), {
                method: "DELETE",
                credentials: "include",
                headers: {
                    'Accept': 'application/json',
                },
            });

            if(response.ok){
                onSuccess && onSuccess("Unshared successfully.");
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
    },  

    unshareAll: async (
        wipId: string,
        onSuccess?: (description: string) => void,
        onError?: (description: string) => void
    ): Promise<boolean> => {
        try{
            const response = await fetch(endpoints.wips.unshareAll(wipId), {
                method: "DELETE",
                credentials: "include",
                headers: {
                    'Accept': 'application/json',
                },
            });

            if(response.ok){
                onSuccess && onSuccess("Unshared successfully.");
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
    },  
}