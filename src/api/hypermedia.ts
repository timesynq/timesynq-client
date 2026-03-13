import { trimUTC } from "@/utils/date";
import { PagedListFields } from "./paged-list"
import { Result, ResultFactory } from "./result";
import { UNEXPECTED_ERROR_MESSAGE } from "./api-error";

export type HypermediaFetcher<T> = (url: string) => Promise<Result<PagedListFields<T>>>;

export async function fetchHypermedia<T>(url: string): Promise<Result<PagedListFields<T>>> {
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: { "Accept": "application/json" },
        });
        
        const data = await response.json();
        
        const items: T[] = (data.items ?? []).map((item: any) => {
            const newItem = { ...item };

            if ("createdOnUTC" in item && item.createdOnUTC) {
                newItem.createdOnUTC = trimUTC(item.createdOnUTC);
            }

            if ("lastOpenedOnUTC" in item && item.lastOpenedOnUTC) {
                newItem.lastOpenedOnUTC = trimUTC(item.lastOpenedOnUTC);
            }

            return newItem;
        });

        const pagedListFields: PagedListFields<T> = {
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
        return ResultFactory.success(pagedListFields);
    }
    catch(_error){
        return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
    }
}