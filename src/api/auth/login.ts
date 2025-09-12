import { endpoints } from "../endpoints";

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

    if(loginRequest.username.length < 3 || loginRequest.username.length > 24){
        errors.push("Username is not 3-24 characters long.")
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(loginRequest.username)) {
        errors.push("Username can only contain letters, numbers, and underscores.");
    }

    if(loginRequest.password.length < 12){
        errors.push("Password must be at least 12 characters long.");
    }

    const passwordRegex = /^[\x21-\x7E]*$/;
    if (!passwordRegex.test(loginRequest.password)) {
        errors.push("Password contains invalid characters.");
    }
    
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