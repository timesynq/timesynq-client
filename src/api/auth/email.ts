import { ApiError, ApiErrorFactory } from "../api-error";
import { endpoints } from "../endpoints";

export type EmailStatus = {
    email: string
    isEmailConfirmed: boolean
}

export const email = async (onError?: (description: string) => void): Promise<EmailStatus | null> => {
    try {
        const response = await fetch(endpoints.auth.email(), {
            method: "GET",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        
        if (response.ok){
            const data = await response.json();
            return data as EmailStatus;
        }

        return null;
    }
    catch (error) {
        const apiError: ApiError = ApiErrorFactory.createFetchError(error, "email");
        onError && onError(apiError.detail);
        return null;
    }
}

export type ChangeEmailRequest = {
    newEmail: string
}

export type ChangeEmailError = {
    detail?: string
    errors: string[]
} 

export const changeEmail = async (): Promise<void | ChangeEmailError> => {

}

export type ResendConfirmationEmailRequest = {
    email: string
}

export type ResendConfirmationEmailError = ChangeEmailError;

export const resendConfirmationEmail = async(): Promise<void | ResendConfirmationEmailError> => {

}