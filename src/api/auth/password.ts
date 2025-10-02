import { UNEXPECTED_ERROR_MESSAGE } from "../api-error"
import { endpoints } from "../endpoints"
import { AuthFieldValidation } from "./validation"

export type ChangePasswordRequest = {
    oldPassword: string
    newPassword: string
}

export type ChangePasswordError = {
    detail?: string
    errors: string[]
}

const validateChangePasswordInputs = (changePasswordRequest: ChangePasswordRequest): string[] => {
    const errors: string[] = [];
    errors.push(...AuthFieldValidation.validatePassword(changePasswordRequest.newPassword));
    return errors;
}

export const changePassword = async (changePasswordRequest: ChangePasswordRequest, onSuccess?: (description: string) => void): Promise<void | ChangePasswordError> => {
    try {
            const validationErrors: string[] = validateChangePasswordInputs(changePasswordRequest);
            if(validationErrors.length > 0){
                return {
                    errors: validationErrors,
                };
            }
    
            const response = await fetch(endpoints.auth.changePassword(), {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(changePasswordRequest)
            });
            
            if (response.ok){
                onSuccess && onSuccess("Password successfully changed.")
                return;
            }
    
            const rawError = await response.json();
    
            const simplifiedError: ChangePasswordError = {
                detail: rawError?.detail,
                errors: [],
            };
    
            if (rawError.errors && typeof rawError.errors === "object") {
                for (const key in rawError.errors) {
                    if (Array.isArray(rawError.errors[key])) {
                        simplifiedError.errors.push(...rawError.errors[key]);
                    }
                }
            }
    
            return simplifiedError;
    }
    catch (error) {
        return {
            detail: UNEXPECTED_ERROR_MESSAGE,
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }
}

export type SendResetCodeRequest = {
    email: string
}

export type SendResetCodeError = ChangePasswordError;

const validateSendResetCodeInputs = (sendResetCodeRequest: SendResetCodeRequest): string[] => {
    const errors = [];
    errors.push(...AuthFieldValidation.validateEmail(sendResetCodeRequest.email));
    return errors;
}

export const sendResetCode = async (sendResetCodeRequest: SendResetCodeRequest): Promise<void | SendResetCodeError> => {
    try {
            const validationErrors: string[] = validateSendResetCodeInputs(sendResetCodeRequest);
            if(validationErrors.length > 0){
                return {
                    errors: validationErrors,
                };
            }
    
            const response = await fetch(endpoints.auth.forgotPassword(), {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sendResetCodeRequest)
            });
            
            if (response.ok){
                return;
            }
    
            const rawError = await response.json();
    
            const simplifiedError: ChangePasswordError = {
                detail: rawError?.detail,
                errors: [],
            };
    
            if (rawError.errors && typeof rawError.errors === "object") {
                for (const key in rawError.errors) {
                    if (Array.isArray(rawError.errors[key])) {
                        simplifiedError.errors.push(...rawError.errors[key]);
                    }
                }
            }
    
            return simplifiedError;
    }
    catch (error) {
        return {
            detail: UNEXPECTED_ERROR_MESSAGE,
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }
}

export type ResetPasswordRequest = {
    email: string
    resetCode: string
    newPassword: string
}

export type ResetPasswordError = ChangePasswordError;

const validateResetPasswordInputs = (resetPasswordRequest: ResetPasswordRequest): string[] => {
    const errors = [];
    errors.push(...AuthFieldValidation.validateEmail(resetPasswordRequest.email));
    errors.push(...AuthFieldValidation.validatePassword(resetPasswordRequest.newPassword));
    return errors;
}

export const resetPassword = async (resetPasswordRequest: ResetPasswordRequest): Promise<void | ResetPasswordError> => {
    try {
        const validationErrors: string[] = validateResetPasswordInputs(resetPasswordRequest);
        if(validationErrors.length > 0){
            return {
                errors: validationErrors,
            };
        }

        const response = await fetch(endpoints.auth.resetPassword(), {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resetPasswordRequest)
        });
        
        if (response.ok){
            return;
        }

        const rawError = await response.json();

        const simplifiedError: ChangePasswordError = {
            detail: rawError?.detail,
            errors: [],
        };

        if (rawError.errors && typeof rawError.errors === "object") {
            for (const key in rawError.errors) {
                if (Array.isArray(rawError.errors[key])) {
                    simplifiedError.errors.push(...rawError.errors[key]);
                }
            }
        }

        return simplifiedError;
    }
    catch (error) {
        return {
            detail: UNEXPECTED_ERROR_MESSAGE,
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }
}