import { Wip, WipService, WipShareSortField, WipSortField } from "@/api/wips/wip";
import { InitialPaginationState, usePagination } from "./use-pagination";
import { fetchHypermedia } from "@/api/hypermedia";

export const useWipSearch = (isShared: boolean, onError?: (description: string) => void) => {

    const defaultPaginationState: InitialPaginationState = {
        pageNumber: 1,
        pageSize: 10,
        sortReverse: false,
        sortBy: isShared ? WipShareSortField.name : WipSortField.name
    }

    const {
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
    } = usePagination<Wip>(
        defaultPaginationState,
        isShared ? WipService.getWipsSharedWithMe : WipService.getMyWips,
        fetchHypermedia,
        true,
        onError,
    );

    const trySearch = async (query: string): Promise<boolean> => {
        return await search(query);
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
        trySearch,
        tryGoTo
    }

}