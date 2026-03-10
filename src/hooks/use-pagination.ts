import { HypermediaFetcher } from "@/api/hypermedia";
import { Page, PagedList, PagedListFields } from "@/api/paged-list"
import { Result, ResultFactory } from "@/api/result";
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

    const queryByPage = async (newPageNumber: number): Promise<Result<void>> => {
        newPageNumber = clamp(newPageNumber, 1, totalPages);
        if (searchedQuery || refetchWithEmptySearch){
            return await search(searchedQuery, newPageNumber);
        }
        setPageNumber(newPageNumber);
        return ResultFactory.success<void>(undefined);
    }

    const updatePageSize = async (newPageSize: number): Promise<Result<void>> => {
        newPageSize = clamp(newPageSize, 1, 100);
        if (searchedQuery || refetchWithEmptySearch)
            return await search(searchedQuery, 1, newPageSize);
        setPageSize(newPageSize);
        setPageNumber(1);
        return ResultFactory.success<void>(undefined);
    }

    const updateSortOrder = async (newSortReverse: boolean): Promise<Result<void>> => {
        if (newSortReverse === sortReverse)
            return ResultFactory.error("Already using that sort order.");
        if (searchedQuery || refetchWithEmptySearch)
            return await search(searchedQuery, 1, undefined, newSortReverse);
        setSortReverse(newSortReverse);
        setPageNumber(1);
        return ResultFactory.success<void>(undefined);
    }

    const updateSortBy = async (newSortBy: string): Promise<Result<void>> => {
        if (newSortBy === sortBy)
            return ResultFactory.error("Already using that sort field.");;
        if (searchedQuery || refetchWithEmptySearch)
            return await search(searchedQuery, 1, undefined, undefined, newSortBy);
        setSortBy(newSortBy);
        setPageNumber(1);
        return ResultFactory.success<void>(undefined);
    }

    const search = async (
        query: string | null,
        pageNumberParam?: number,
        pageSizeParam?: number,
        sortReverseParam?: boolean,
        sortByParam?: string,
    ): Promise<Result<void>> => {
        setIsLoading(true);
        const sortOrder: string = (sortReverseParam ?? sortReverse) ? "reverse" : "default";
        const pagedListResult: Result<PagedList<T>> = await searcher(
            query,
            pageNumberParam ?? pageNumber,
            pageSizeParam ?? pageSize,
            sortOrder,
            sortByParam ?? sortBy,
        );
        setIsLoading(false);
        if (!pagedListResult.isSuccessful)
            return ResultFactory.error(pagedListResult.message);
        const pagedList: PagedList<T> = pagedListResult.value;
        setHypermediaResource(pagedList);
        setPageNumber(pagedList.pageNumber());
        setSearchedQuery(query);
        if(pageSizeParam !== undefined) setPageSize(pageSizeParam);
        if(sortReverseParam !== undefined) setSortReverse(sortReverseParam);
        if(sortByParam !== undefined) setSortBy(sortByParam);
        return ResultFactory.success<void>(undefined); 
    }

    const tryGoTo = async (page: Page): Promise<Result<void>> => {
        if (!hypermediaResource)
            return ResultFactory.error("Unable to navigate");
        if(!canGoTo(page))
            return ResultFactory.error("Unable to navigate");
        setIsLoading(true);
        const nextPageResult: Result<PagedList<T>> = await goTo(page);
        setIsLoading(false);
        if (nextPageResult.isSuccessful){
            setHypermediaResource(nextPageResult.value);
            setPageNumber(nextPageResult.value.pageNumber());
            return ResultFactory.success<void>(undefined);
        }
        return ResultFactory.error(nextPageResult.message);
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

    const goTo = async (page: Page): Promise<Result<PagedList<T>>> => {
        let url: string | undefined = undefined;
        switch (page) {
            case Page.First: url = hypermediaResource?.firstPageUrl(); break;
            case Page.Last: url = hypermediaResource?.lastPageUrl(); break;
            case Page.Previous: url = hypermediaResource?.previousPageUrl(); break;
            case Page.Next:
            default: url = hypermediaResource?.nextPageUrl();
        }
        if (!url) 
            return ResultFactory.error("Unable to navigate.");

        const getFieldsResult: Result<PagedListFields<T>> = await hypermediaFetcher(url);
        if (!getFieldsResult.isSuccessful)
            return ResultFactory.error(getFieldsResult.message);
        return ResultFactory.success(new PagedList<T>(getFieldsResult.value));
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