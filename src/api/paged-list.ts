import { UNEXPECTED_ERROR_MESSAGE } from "./api-error";

export enum Page {
    First,
    Last,
    Next,
    Previous,
}

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
        this._pageSize = pagedListFields.pageSize;
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

    public canGoTo(page: Page): boolean {
        switch (page) {
            case Page.First: return !!this._firstPageUrl && this._pageNumber > 1;
            case Page.Last: return !!this._lastPageUrl && this._pageNumber < this._totalPages;
            case Page.Previous: return !!this._previousPageUrl && this._pageNumber > 1;
            case Page.Next:
            default: return !!this._nextPageUrl && this._pageNumber < this._totalPages;
        }
    }

    public async goTo(page: Page): Promise<PagedList<T> | null> {
        let url: string | undefined = undefined;
        switch (page) {
            case Page.First: url = this._firstPageUrl; break;
            case Page.Last: url = this._lastPageUrl; break;
            case Page.Previous: url = this._previousPageUrl; break;
            case Page.Next:
            default: url = this._nextPageUrl;
        }
        if (!url) 
            return null;
        return this.fetchHypermedia(url);
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
        catch (_error) {
            this._onError && this._onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    }

}