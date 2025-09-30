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
    
    catch (error) {
        onError && onError("Logout failed: Network or unexpected error");
        return false;
    }

}