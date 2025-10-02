import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { endpoints } from "../endpoints";

export const logout = async (onError?: (description: string) => void): Promise<boolean> => {

    try {
        const response = await fetch(endpoints.auth.logout(), {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': '*/*'
            }
        });

        if (response.ok){
            return true;
        }

        onError && onError("Logout failed.");
        return false;
    }
    
    catch (_error) {
        onError && onError(UNEXPECTED_ERROR_MESSAGE);
        return false;
    }

}