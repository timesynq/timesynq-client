import { PagedList } from "./paged-list";

export type Searcher<T> = (
    query: string | null,
    pageNumber: number,
    pageSize: number,
    sortOrder: string,
    sortBy: string,
    onError?: (description: string) => void,
) => Promise<PagedList<T> | null>;