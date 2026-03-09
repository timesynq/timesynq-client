import { fetchHypermedia } from "@/api/hypermedia";
import { InitialPaginationState, usePagination } from "./use-pagination";
import { User, UserService, UserSortField } from "@/api/users/user";
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from "@/api/auth/validation";

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
        false,
        onError,
    );

    const trySearch = async (query: string): Promise<boolean> => {
        const trimmed = query.trim();
        if (trimmed.length < MIN_USERNAME_LENGTH || trimmed.length > MAX_USERNAME_LENGTH) {
            onError && onError(`Please enter between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} letters.`);
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