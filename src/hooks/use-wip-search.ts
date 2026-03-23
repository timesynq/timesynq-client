import { MAX_WIP_NAME_LENGTH, Wip, WipService, WipSortField } from "@/api/wips/wip";
import { InitialPaginationState, usePagination } from "./use-pagination";
import { fetchHypermedia } from "@/api/hypermedia";
import { Result, ResultFactory } from "@/api/result";

export const useWipSearch = () => {

    const defaultPaginationState: InitialPaginationState = {
        pageNumber: 1,
        pageSize: 10,
        sortReverse: false,
        sortBy: WipSortField.lastOpened
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
        WipService.getMyWips,
        fetchHypermedia,
        true,
    );

    const trySearch = async (query: string): Promise<Result<void>> => {
        const trimmed = query.trim();
        if (trimmed.length > MAX_WIP_NAME_LENGTH) {
            return ResultFactory.error(`Wip names cannot exceed ${MAX_WIP_NAME_LENGTH} letters.`);
        }
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