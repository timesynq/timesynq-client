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

const validateInputs = (changePasswordRequest: ChangePasswordRequest): string[] => {
    const errors: string[] = [];
    errors.push(...AuthFieldValidation.validatePassword(changePasswordRequest.newPassword));
    return errors;
}

export const changePassword = async (changePasswordRequest: ChangePasswordRequest, onSuccess: (description: string) => void): Promise<void | ChangePasswordError> => {
    try {
            const validationErrors: string[] = validateInputs(changePasswordRequest);
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
                onSuccess("Password successfully changed.")
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
                detail: "Network or unexpected error",
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
}