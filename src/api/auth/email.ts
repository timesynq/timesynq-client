import { ApiError, ApiErrorFactory } from "../api-error";
import { endpoints } from "../endpoints";
import { AuthFieldValidation } from "./validation";

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
    oldEmail: string
    newEmail: string
}

export type ChangeEmailError = {
    detail?: string
    errors: string[]
} 

const validateResetPasswordInputs = (changeEmailRequest: ChangeEmailRequest): string => {
    if(changeEmailRequest.oldEmail === null || changeEmailRequest.oldEmail.length === 0){
        return "Current email could not be read.";
    }
    if(changeEmailRequest.newEmail === changeEmailRequest.oldEmail){
        return "New email can not be equal to old email.";
    }
    const errors = AuthFieldValidation.validateEmail(changeEmailRequest.newEmail);
    return errors.length > 0 ? errors[0] : "";
}

export const changeEmail = async (changeEmailRequest: ChangeEmailRequest, onSuccess: (description: string) => void, onError: (description: string) => void): Promise<EmailStatus | null> => {
    try{
        //we can get the error by 0 index because for emails specifically, the api only provides an "Email 'x' is invalid" message
        //it is unlikely that that point is ever even reached though

        const validationError: string = validateResetPasswordInputs(changeEmailRequest);
        if(validationError !== ""){
            onError(validationError);
            return null;
        }

        const response = await fetch(endpoints.auth.changeEmail(), {
            method: "POST",
            credentials: "include",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(changeEmailRequest),
        });

        const data = await response.json();

        if(response.ok){
            onSuccess("Verification email sent!");
            return data as EmailStatus;
        }
        
        const simplifiedError: ChangeEmailError = {
            detail: data?.detail,
            errors: [],
        };

        if (data.errors && typeof data.errors === "object") {
            for (const key in data.errors) {
                if (Array.isArray(data.errors[key])) {
                    simplifiedError.errors.push(...data.errors[key]);
                }
            }
        }

        onError(simplifiedError.errors.length > 0 ? simplifiedError.errors[0] : simplifiedError.detail ? simplifiedError.detail : "Unknown error");
        return null;
    }
    catch (error) {
        const apiError: ApiError = ApiErrorFactory.createFetchError(error, "changeEmail");
        onError(apiError.detail);
        return null;
    }
}

export type ResendConfirmationEmailRequest = {
    email: string
}

export type ResendConfirmationEmailError = ChangeEmailError;

export const resendConfirmationEmail = async(): Promise<void | ResendConfirmationEmailError> => {

}