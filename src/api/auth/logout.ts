import { endpoints } from "../endpoints";

export type LogoutError = {
    detail?: string
    errors: string[]
}

export namespace Logout {
    export const handler = async (): Promise<void> => {
        const result = await logout();
        if (result) {
            console.error("Logout failed:", result);
            return;
        }
        window.location.reload();
    };
}

export const logout = async (): Promise<void | LogoutError> => {

    try {
        const response = await fetch(endpoints.auth.logout(), {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': '*/*'
            }
        });

        if (response.ok){
            return;
        }

        return {
            detail: "Logout failed.",
            errors: [],
        };
    }
    
    catch (error) {
        return {
            detail: "Network or unexpected error",
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }

}