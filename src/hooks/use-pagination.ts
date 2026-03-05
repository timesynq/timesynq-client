import { useState } from "react"

export interface PaginationState {
    page: number,
    pageSize: number,
    sortBy: string,
    sortReverse: boolean
}

export const usePagination = (initialState?: Partial<PaginationState>) => {
    const [page, setPage] = useState<number>(initialState?.page ?? 1);
    const [pageSize, setPageSize] = useState<number>(initialState?.pageSize ?? 10);
    const [sortBy, setSortBy] = useState<string | undefined>(initialState?.sortBy)
    const [sortReverse, setSortReverse] = useState<boolean>(initialState?.sortReverse ?? false);

    const resetPage = () => {
        setPage(1);
    }

    const updatePageSize = (newPageSize: number) => {
        setPageSize(newPageSize);
        resetPage();
    }

    const updateSort = (field: string, reverse: boolean) => {
        setSortBy(field);
        setSortReverse(reverse);
        resetPage();
    }

    return {
        page,
        pageSize,
        sortBy,
        sortReverse,
        setPage,
        setSortReverse,
        setSortBy,
        updatePageSize,
        updateSort
    }

}