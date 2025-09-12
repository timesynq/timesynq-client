import { endpoints } from "../endpoints";
import { AuthFieldValidation } from "./validation";

export type LoginRequest = {
    username: string
    password: string
}

export type LoginError = {
    detail?: string
    errors: string[]
}

const validateInputs = (loginRequest: LoginRequest): string[] => {
    const errors: string[] = [];
    errors.push(...AuthFieldValidation.ValidateUsername(loginRequest.username));
    errors.push(...AuthFieldValidation.ValidatePassword(loginRequest.password));
    return errors;
}

export const login = async (loginRequest: LoginRequest): Promise<void | LoginError> => {
    try {

        const validationErrors: string[] = validateInputs(loginRequest);
        if(validationErrors.length > 0){
            return {
                errors: validationErrors,
            };
        }

        const response = await fetch(endpoints.auth.login(), {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginRequest)
        });
        
        if (response.ok){
            return;
        }

        return {
            detail: "Invalid login credentials.",
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