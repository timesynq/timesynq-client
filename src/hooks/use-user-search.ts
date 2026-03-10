import { fetchHypermedia } from "@/api/hypermedia";
import { InitialPaginationState, usePagination } from "./use-pagination";
import { User, UserService, UserSortField } from "@/api/users/user";
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from "@/api/auth/validation";
import { Result, ResultFactory } from "@/api/result";

export const useUserSearch = () => {
    
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
    );

    const trySearch = async (query: string): Promise<Result<void>> => {
        const trimmed = query.trim();
        if (trimmed.length < MIN_USERNAME_LENGTH || trimmed.length > MAX_USERNAME_LENGTH) {
            return ResultFactory.error(`Please enter between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} letters.`)
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