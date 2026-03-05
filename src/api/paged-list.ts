import { UNEXPECTED_ERROR_MESSAGE } from "./api-error";
import { HypermediaFetcher } from "./hypermedia";

export enum Page {
    First,
    Last,
    Next,
    Previous,
}

export interface PagedListFields<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    firstPageUrl?: string;
    lastPageUrl?: string;
    previousPageUrl?: string;
    nextPageUrl?: string;
}

export class PagedList<T> {
    
    private _fields: PagedListFields<T>;
    private _fetcher: HypermediaFetcher<T>;
    private _onError?: (description: string) => void;
    
    constructor(
        fields: PagedListFields<T>,
        fetcher: HypermediaFetcher<T>, 
        onError?: (description: string) => void
    ) {
        this._fields = fields;
        this._fetcher = fetcher;
        this._onError = onError;
    }

    public items(): T[] { return this._fields.items; }
    public pageNumber(): number { return this._fields.pageNumber; }
    public pageSize(): number { return this._fields.pageSize; }
    public totalItems(): number { return this._fields.totalItems; }
    public totalPages(): number { return this._fields.totalPages; }

    public canGoTo(page: Page): boolean {
        switch (page) {
            case Page.First: return !!this._fields.firstPageUrl && this.pageNumber() > 1;
            case Page.Last: return !!this._fields.lastPageUrl && this.pageNumber() < this.totalPages();
            case Page.Previous: return !!this._fields.previousPageUrl && this.pageNumber() > 1;
            case Page.Next:
            default: return !!this._fields.nextPageUrl && this.pageNumber() < this.totalPages();
        }
    }

    public async goTo(page: Page): Promise<PagedList<T> | null> {
        let url: string | undefined = undefined;
        switch (page) {
            case Page.First: url = this._fields.firstPageUrl; break;
            case Page.Last: url = this._fields.lastPageUrl; break;
            case Page.Previous: url = this._fields.previousPageUrl; break;
            case Page.Next:
            default: url = this._fields.nextPageUrl;
        }
        if (!url) 
            return null;

        try {
            const fields: PagedListFields<T> | null = await this._fetcher(url);
            if (!fields)
                return null;
            return new PagedList<T>(fields, this._fetcher, this._onError);
        }
        catch {
            this._onError && this._onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    }

}