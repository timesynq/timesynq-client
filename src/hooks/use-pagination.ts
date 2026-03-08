import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { HypermediaFetcher } from "@/api/hypermedia";
import { Page, PagedList, PagedListFields } from "@/api/paged-list"
import { Searcher } from "@/api/searcher";
import { clamp } from "@/utils/math";
import { useState } from "react"

export interface InitialPaginationState {
    pageNumber: number,
    pageSize: number,
    sortReverse: boolean,
    sortBy: string,
}

export const usePagination = <T>(
    initialState: InitialPaginationState,
    searcher: Searcher<T>,
    hypermediaFetcher: HypermediaFetcher<T>,
    refetchWithEmptySearch: boolean,
    onError?: (description: string) => void,
) => {

    const [hypermediaResource, setHypermediaResource] = useState<PagedList<T> | null>(null);

    const items = hypermediaResource?.items() ?? [];
    const totalPages = hypermediaResource?.totalPages() ?? 0;
    const [pageNumber, setPageNumber] = useState<number>(initialState.pageNumber);
    const [pageSize, setPageSize] = useState<number>(initialState.pageSize);
    const [sortReverse, setSortReverse] = useState<boolean>(initialState.sortReverse);
    const [sortBy, setSortBy] = useState<string>(initialState.sortBy);
    const [searchedQuery, setSearchedQuery] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const queryByPage = (newPageNumber: number) => {
        newPageNumber = clamp(newPageNumber, 1, totalPages);
        if (searchedQuery || refetchWithEmptySearch)
            search(searchedQuery, newPageNumber);
        else 
            setPageNumber(newPageNumber);
    }

    const updatePageSize = (newPageSize: number): void => {
        newPageSize = clamp(newPageSize, 1, 100);
        if (searchedQuery || refetchWithEmptySearch)
            search(searchedQuery, 1, newPageSize);
        else {
            setPageSize(newPageSize);
            setPageNumber(1);
        }
    }

    const updateSortOrder = (newSortReverse: boolean): void => {
        if (newSortReverse === sortReverse)
            return;
        if (searchedQuery || refetchWithEmptySearch)
            search(searchedQuery, 1, undefined, newSortReverse);
        else {
            setSortReverse(newSortReverse);
            setPageNumber(1);
        }
    }

    const updateSortBy = (newSortBy: string): void => {
        if (newSortBy === sortBy)
            return;
        if (searchedQuery || refetchWithEmptySearch)
            search(searchedQuery, 1, undefined, undefined, newSortBy);
        else {
            setSortBy(newSortBy);
            setPageNumber(1);
        }
    }

    const search = async (
        query: string | null,
        pageNumberParam?: number,
        pageSizeParam?: number,
        sortReverseParam?: boolean,
        sortByParam?: string,
    ): Promise<boolean> => {
        setIsLoading(true);
        const sortOrder: string = (sortReverseParam ?? sortReverse) ? "reverse" : "default";
        const pagedList: PagedList<T> | null = await searcher(
            query,
            pageNumberParam ?? pageNumber,
            pageSizeParam ?? pageSize,
            sortOrder,
            sortByParam ?? sortBy,
            onError,
        );
        setIsLoading(false);
        if (pagedList === null)
            return false;
        setHypermediaResource(pagedList);
        setPageNumber(pagedList.pageNumber());
        setSearchedQuery(query);
        if(pageSizeParam !== undefined) setPageSize(pageSizeParam);
        if(sortReverseParam !== undefined) setSortReverse(sortReverseParam);
        if(sortByParam !== undefined) setSortBy(sortByParam);
        return true; 
    }

    const tryGoTo = async (page: Page) => {
        if (!hypermediaResource)
            return;
        if(!canGoTo(page))
            return;
        setIsLoading(true);
        const nextPage: PagedList<T> | null = await goTo(page);
        setIsLoading(false);
        if (nextPage){
            setHypermediaResource(nextPage);
            setPageNumber(nextPage.pageNumber());
        }
    }

    const canGoTo = (page: Page): boolean => {
        if(!hypermediaResource)
            return false;
        const hr: PagedList<T> = hypermediaResource;
        switch (page) {
            case Page.First: return !!hr.firstPageUrl() && hr.pageNumber() > 1;
            case Page.Last: return !!hr.lastPageUrl() && hr.pageNumber() < hr.totalPages();
            case Page.Previous: return !!hr.previousPageUrl() && hr.pageNumber() > 1;
            case Page.Next:
            default: return !!hr.nextPageUrl() && hr.pageNumber() < hr.totalPages();
        }
    }

    const goTo = async (page: Page): Promise<PagedList<T> | null> => {
        let url: string | undefined = undefined;
        switch (page) {
            case Page.First: url = hypermediaResource?.firstPageUrl(); break;
            case Page.Last: url = hypermediaResource?.lastPageUrl(); break;
            case Page.Previous: url = hypermediaResource?.previousPageUrl(); break;
            case Page.Next:
            default: url = hypermediaResource?.nextPageUrl();
        }
        if (!url) 
            return null;

        try {
            const fields: PagedListFields<T> | null = await hypermediaFetcher(url);
            if (!fields)
                return null;
            return new PagedList<T>(fields);
        }
        catch {
            onError && onError(UNEXPECTED_ERROR_MESSAGE);
            return null;
        }
    }

    return {
        // read only values
        items,
        pageNumber,
        pageSize,
        totalPages,
        sortReverse,
        sortBy,
        isLoading,

        // api functions
        queryByPage,
        updatePageSize,
        updateSortOrder,
        updateSortBy,
        search,
        tryGoTo
    }
}