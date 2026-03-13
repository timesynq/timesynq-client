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
    
    constructor(
        fields: PagedListFields<T>,
    ) {
        this._fields = fields;
    }

    public items(): T[] { return this._fields.items; }
    public pageNumber(): number { return this._fields.pageNumber; }
    public pageSize(): number { return this._fields.pageSize; }
    public totalItems(): number { return this._fields.totalItems; }
    public totalPages(): number { return this._fields.totalPages; }
    public firstPageUrl(): string | undefined { return this._fields.firstPageUrl; }
    public lastPageUrl(): string | undefined { return this._fields.lastPageUrl; }
    public previousPageUrl(): string | undefined { return this._fields.previousPageUrl; }
    public nextPageUrl(): string | undefined { return this._fields.nextPageUrl; }
}