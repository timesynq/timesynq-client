import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { endpoints } from "../endpoints";
import { Result, ResultFactory } from "../result";
import { AuthFieldValidation } from "./validation";

export type EmailStatus = {
    email: string
    isEmailConfirmed: boolean
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

export const changeEmail = async (changeEmailRequest: ChangeEmailRequest): Promise<Result<EmailStatus>> => {
    try{
        //we can get the error by 0 index because for emails specifically, the api only provides an "Email 'x' is invalid" message
        //it is unlikely that that point is ever even reached though

        const validationError: string = validateResetPasswordInputs(changeEmailRequest);
        if(validationError !== ""){
            return ResultFactory.error(validationError);
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
            return ResultFactory.success(data as EmailStatus);
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

        return ResultFactory.error(
            simplifiedError.errors.length > 0 ?
            simplifiedError.errors[0] :
                simplifiedError.detail ? 
                simplifiedError.detail :
                "Unknown error"
        );
    }
    catch (_error) {
        return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
    }
}

export type ResendConfirmationEmailRequest = {
    email: string
}

export type ResendConfirmationEmailError = ChangeEmailError;

export const resendConfirmationEmail = async(resendConfirmationEmailRequest: ResendConfirmationEmailRequest): Promise<Result<void>> => {
    try {
        const response = await fetch(endpoints.auth.resendConfirmationEmail(), {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resendConfirmationEmailRequest)
        });
        
        if (response.ok){
            return ResultFactory.success<void>(undefined);
        }

        return ResultFactory.error("Resend failed. Please try again later.");
    }
    catch (_error) {
        return ResultFactory.error(UNEXPECTED_ERROR_MESSAGE);
    }
}