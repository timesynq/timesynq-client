import { ApiError, ApiErrorFactory } from "./api-error";

export class PagedList<T> {
    
    private _items: T[];
    private _pageNumber: number;
    private _pageSize: number;
    private _totalItems: number;
    private _totalPages: number;
    private _firstPageUrl?: string;
    private _lastPageUrl?: string;
    private _previousPageUrl?: string;
    private _nextPageUrl?: string;
    private _onError?: (description: string) => void;
    
    constructor(pagedListFields: {
        items: T[],
        pageNumber: number,
        pageSize: number,
        totalItems: number,
        totalPages: number,
        firstPageUrl?: string,
        lastPageUrl?: string,
        previousPageUrl?: string,
        nextPageUrl?: string,
        onError?: (description: string) => void;
    }) {
        this._items = pagedListFields.items;
        this._pageNumber = pagedListFields.pageNumber;
        this._pageSize = pagedListFields.pageNumber;
        this._totalItems = pagedListFields.totalItems;
        this._totalPages = pagedListFields.totalPages;
        this._firstPageUrl = pagedListFields.firstPageUrl;
        this._lastPageUrl = pagedListFields.lastPageUrl;
        this._previousPageUrl = pagedListFields.previousPageUrl;
        this._nextPageUrl = pagedListFields.nextPageUrl;
        this._onError = pagedListFields.onError;
    }

    public items(): T[] {
        return this._items;
    }

    public pageNumber(): number {
        return this._pageNumber;
    }

    public pageSize(): number {
        return this._pageSize;
    }

    public totalItems(): number {
        return this._totalItems;
    }

    public totalPages(): number {
        return this._totalPages;
    }

    public async getFirstPage(): Promise<PagedList<T> | null> {
        return this._firstPageUrl ? this.fetchHypermedia(this._firstPageUrl) : null;
    }

    public async getLastPage(): Promise<PagedList<T> | null> {
        return this._lastPageUrl ? this.fetchHypermedia(this._lastPageUrl) : null;
    }

    public async getPreviousPage(): Promise<PagedList<T> | null> {
        return this._previousPageUrl ? this.fetchHypermedia(this._previousPageUrl) : null;
    }

    public async getNextPage(): Promise<PagedList<T> | null> {
        return this._nextPageUrl ? this.fetchHypermedia(this._nextPageUrl) : null;
    }

    private async fetchHypermedia(url: string): Promise<PagedList<T> | null> {
        try {
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
                onError: this._onError,
            }
             
            return new PagedList<T>(pagedListFields);
        }
        catch (error) {
            const apiError: ApiError = ApiErrorFactory.createFetchError(error, "fetchHypermedia");
            this._onError && this._onError(apiError.detail);
            return null;
        }
    }

}