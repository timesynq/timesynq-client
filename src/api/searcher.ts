import { PagedList } from "./paged-list";
import { Result } from "./result";

export type Searcher<T> = (
    query: string | null,
    pageNumber: number,
    pageSize: number,
    sortOrder: string,
    sortBy: string,
) => Promise<Result<PagedList<T>>>;