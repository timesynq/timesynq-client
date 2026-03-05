import { PagedListFields } from "./paged-list"

export type HypermediaFetcher<T> = (url: string) => Promise<PagedListFields<T> | null>;

export async function fetchHypermedia<T>(url: string): Promise<PagedListFields<T> | null> {
    const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/json" },
    });
    
    const data = await response.json();
    const pagedListFields: PagedListFields<T> = {
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
    return pagedListFields
}