import { UNEXPECTED_ERROR_MESSAGE } from "../api-error";
import { endpoints } from "../endpoints";
import { AuthFieldValidation } from "./validation";

export type LoginRequest = {
    username: string
    password: string
    rememberMe: boolean
}

export type LoginError = {
    detail?: string
    errors: string[]
}

const validateInputs = (loginRequest: LoginRequest): string[] => {
    const errors: string[] = [];
    errors.push(...AuthFieldValidation.validateUsername(loginRequest.username));
    errors.push(...AuthFieldValidation.validatePassword(loginRequest.password));
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

        const response = await fetch(endpoints.auth.login(true, !loginRequest.rememberMe), {
            method: "POST",
            credentials: 'include',
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
            detail: UNEXPECTED_ERROR_MESSAGE,
            errors: [error instanceof Error ? error.message : String(error)],
        };
    }
}