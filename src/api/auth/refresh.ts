import { endpoints } from "../endpoints";

export const refreshCookie = async (useSessionCookies: boolean = true): Promise<boolean> => {
    try {
        const response = await fetch(endpoints.auth.refreshCookie(useSessionCookies), {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': '*/*'
            }
        });

        if (response.ok){
            return true;
        }

        return false;
    }
    
    catch (error) {
        return false;
    }
}