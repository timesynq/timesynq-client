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

    public totalpages(): number {
        return this._totalPages;
    }

    public getFirstPage(): PagedList<T> | null {
        return this._firstPageUrl ? this.fetchHypermedia(this._firstPageUrl) : null;
    }

    public getLastPage(): PagedList<T> | null {
        return this._lastPageUrl ? this.fetchHypermedia(this._lastPageUrl) : null;
    }

    public getPreviousPage(): PagedList<T> | null {
        return this._previousPageUrl ? this.fetchHypermedia(this._previousPageUrl) : null;
    }

    public getNextPage(): PagedList<T> | null {
        return this._nextPageUrl ? this.fetchHypermedia(this._nextPageUrl) : null;
    }

    private fetchHypermedia(link: string): PagedList<T> | null {
        return null;
    }

}