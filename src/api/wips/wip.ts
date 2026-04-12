import { trimUTC } from "@/utils/date";
import { ApiError, UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { endpoints } from "../endpoints";
import { PagedList } from "../paged-list";
import { User } from "../users/user";
import { Result, ResultFactory } from "../result";

export const WIP_CONSTANTS = {
    MAX_NAME_LENGTH: 100,
    MIN_BPM: 20,
    MAX_BPM: 999,
    MIN_CHANNELS: 1,
    MAX_CHANNELS: 16,
}

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

export type ShareStatus = {
    isAccepted: boolean,
}
export type SharedWip = Wip & ShareStatus & {
    ownerName: string,
    sharedOnUTC: Date,
};
export type SharedUser = User & ShareStatus;

export const WipService = {

    getMyWips: async (
        searchString: string | null = null,
        pageNumber: number = 1,
        pageSize: number = 20,
        sortOrder: string,
        sortBy: string,
    ): Promise<Result<PagedList<Wip>>> => {
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
            }
    
            return ResultFactory.success(new PagedList<Wip>(pagedListFields));
        } 
        catch (_error) {
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    },

    create: async (): Promise<Result<Wip>> => {
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
                return ResultFactory.success({
                    ...data,
                    createdOnUTC: trimUTC(data.createdOnUTC),
                    lastOpenedOnUTC: trimUTC(data.lastOpenedOnUTC)
                }); 
            }
            
            const error = data as ApiError;
            return ResultFactory.error(error.detail);
        }
        
        catch (_error) {
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    },

    changeWipName: async (wipId: string, changeWipNameRequest: ChangeWipNameRequest): Promise<Result<void>> => {
        try{
            const response = await fetch(endpoints.wips.changeWipName(wipId), {
                method: "PATCH",
                credentials: "include",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(changeWipNameRequest),
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

    delete: async (wipId: string): Promise<Result<void>> => {
        try{
            const response = await fetch(endpoints.wips.delete(wipId), {
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
    },

    getUnacceptedWipsSharedWithMe: async (
        searchString: string | null = null,
        pageNumber: number = 1,
        pageSize: number = 20,
        sortOrder: string,
        sortBy: string,
    ): Promise<Result<PagedList<SharedWip>>> => {
        try {
            const url = new URL(endpoints.wips.getSharedWips());
            url.search = new URLSearchParams({
                ...(searchString !== null && {searchString}),
                isAccepted: `${false}`,
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

            const items: SharedWip[] = (data.items ?? []).map((item: any) => {
                return {
                    ...item,
                    sharedOnUTC: item.sharedOnUTC
                        ? trimUTC(item.sharedOnUTC)
                        : null,
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
            }
    
            return ResultFactory.success(new PagedList<SharedWip>(pagedListFields));
        } 
        catch (_error) {
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    },

    getAcceptedWipsSharedWithMe: async (
        searchString: string | null = null,
        pageNumber: number = 1,
        pageSize: number = 20,
        sortOrder: string,
        sortBy: string,
    ): Promise<Result<PagedList<SharedWip>>> => {
        try {
            const url = new URL(endpoints.wips.getSharedWips());
            url.search = new URLSearchParams({
                ...(searchString !== null && {searchString}),
                isAccepted: `${true}`,
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

            const items: SharedWip[] = (data.items ?? []).map((item: any) => {
                return {
                    ...item,
                    sharedOnUTC: item.sharedOnUTC
                        ? trimUTC(item.sharedOnUTC)
                        : null,
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
            }
    
            return ResultFactory.success(new PagedList<SharedWip>(pagedListFields));
        } 
        catch (_error) {
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    },

    getSharedUsers: async (wipId: string): Promise<Result<SharedUser[]>> => {
        try {
            const response = await fetch(endpoints.wips.getSharedUsers(wipId), {
                method: "GET",
                credentials: "include",
                headers: { "Accept": "application/json" },
            });

            const data = await response.json();
            return ResultFactory.success(data as SharedUser[]);
        } 
        catch (_error) {
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    },

    share: async (wipId: string, shareWipRequest: ShareWipRequest): Promise<Result<User>> => {
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
                return ResultFactory.success(data as User);
            }
            
            const error = data as ApiError;
            return ResultFactory.error(error.detail);
        }
        catch (_error) {
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    },

    acceptShare: async (wipId: string): Promise<Result<void>> => {
        try{
            const response = await fetch(endpoints.wips.acceptShare(wipId), {
                method: "PATCH",
                credentials: "include",
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
            console.log(_error);
            return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
        }
    },

    unshareOne: async (wipId: string, userId: string): Promise<Result<void>> => {
        try{
            const response = await fetch(endpoints.wips.unshareOne(wipId, userId), {
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
    },  

    unshareAll: async (wipId: string): Promise<Result<void>> => {
        try{
            const response = await fetch(endpoints.wips.unshareAll(wipId), {
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
    },  
}