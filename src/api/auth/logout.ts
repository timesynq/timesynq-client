import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { endpoints } from "../endpoints";
import { Result, ResultFactory } from "../result";

export const logout = async (): Promise<Result<void>> => {

    try {
        const response = await fetch(endpoints.auth.logout(), {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': '*/*'
            }
        });

        if (response.ok){
            return ResultFactory.success<void>(undefined);
        }

        return ResultFactory.error("Logout failed.");
    }
    
    catch (_error) {
        return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
    }

}