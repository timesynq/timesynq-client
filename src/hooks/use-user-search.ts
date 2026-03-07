import { fetchHypermedia } from "@/api/hypermedia";
import { InitialPaginationState, usePagination } from "./use-pagination";
import { User, UserService, UserSortField } from "@/api/users/user";

export const useUserSearch = (onError?: (description: string) => void) => {
    
    const defaultPaginationState: InitialPaginationState = {
        pageNumber: 1,
        pageSize: 10,
        sortReverse: false,
        sortBy: UserSortField.username
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
    } = usePagination<User>(
        defaultPaginationState,
        UserService.search,
        fetchHypermedia,
        onError,
    );

    const trySearch = async (query: string): Promise<boolean> => {
        if (query.trim().length < 3) {
            onError && onError("Please enter at least 3 letters.");
            return false;
        }
        const succeeded: boolean = await search(query);
        return succeeded;
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