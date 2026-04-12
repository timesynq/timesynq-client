import { SharedWip, WIP_CONSTANTS, WipService, WipShareSortField } from "@/api/wips/wip";
import { InitialPaginationState, usePagination } from "./use-pagination";
import { fetchHypermedia } from "@/api/hypermedia";
import { Result, ResultFactory } from "@/api/result";

export const useSharedWipSearch = (isAccepted: boolean) => {

    const defaultPaginationState: InitialPaginationState = {
        pageNumber: 1,
        pageSize: 10,
        sortReverse: false,
        sortBy: WipShareSortField.shareAge
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
    } = usePagination<SharedWip>(
        defaultPaginationState,
        isAccepted ? WipService.getAcceptedWipsSharedWithMe : WipService.getUnacceptedWipsSharedWithMe,
        fetchHypermedia,
        true,
    );

    const trySearch = async (query: string): Promise<Result<void>> => {
        const trimmed = query.trim();
        if (trimmed.length > WIP_CONSTANTS.MAX_NAME_LENGTH) {
            return ResultFactory.error(`Wip names cannot exceed ${WIP_CONSTANTS.MAX_NAME_LENGTH} letters.`);
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