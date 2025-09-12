import { endpoints } from "../endpoints";

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

    if(registerRequest.username.length < 3 || registerRequest.username.length > 24){
        errors.push("Username must be 3-24 characters long.");
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(registerRequest.username)) {
        errors.push("Username can only contain letters, numbers, and underscores.");
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(registerRequest.email)) {
        errors.push("Email address is invalid.");
    }

    if(registerRequest.password.length < 12){
        errors.push("Password must be at least 12 characters long.");
    }

    const passwordRegex = /^[\x21-\x7E]*$/;
    if (!passwordRegex.test(registerRequest.password)) {
        errors.push("Password contains invalid characters.");
    }

    if(registerRequest.password != registerRequest.confirmPassword){
        errors.push("Passwords do not match.");
    }
    
    return errors;

}

export const register = async (registerRequest: RegisterRequest): Promise<void | RegisterError> => {
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
