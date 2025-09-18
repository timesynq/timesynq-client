import { endpoints } from "../endpoints";
import { AuthFieldValidation } from "./validation";

export type RegisterRequest = {
    username: string
    email: string
    password: string
    confirmPassword: string
}

export type RegisterError = {
    detail?: string
    errors: string[]
}

const validateInputs = (registerRequest: RegisterRequest): string[] => {

    const errors: string[] = [];

    errors.push(...AuthFieldValidation.validateUsername(registerRequest.username));
    errors.push(...AuthFieldValidation.validateEmail(registerRequest.email));
    errors.push(...AuthFieldValidation.validatePassword(registerRequest.password));

    if(registerRequest.password != registerRequest.confirmPassword){
        errors.push("Passwords do not match.");
    }
    
    return errors;

}

export const register = async (registerRequest: RegisterRequest, onSuccess: (description: string) => void): Promise<void | RegisterError> => {
    try {

        const validationErrors: string[] = validateInputs(registerRequest);
        if(validationErrors.length > 0){
            return {
                errors: validationErrors,
            };
        }

        const response = await fetch(endpoints.auth.register(), {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerRequest)
        });
        
        if (response.ok){
            onSuccess("Verification email sent!")
            return;
        }

        const rawError = await response.json();

        const simplifiedError: RegisterError = {
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
