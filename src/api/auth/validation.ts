export namespace AuthFieldValidation {

    export const ValidateUsername = (username: string): string[] => {

        const MIN_USERNAME_LENGTH = 3
        const MAX_USERNAME_LENGTH = 24
        const errors: string[] = [];

        if(username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH){
            errors.push(`Username is not ${MIN_USERNAME_LENGTH}-${MAX_USERNAME_LENGTH} characters long.`)
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            errors.push("Username can only contain letters, numbers, and underscores.");
        }

        return errors;
    } 

    export const ValidateEmail = (email: string): string[] => {

        const errors: string[] = [];

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            errors.push("Email address is invalid.");
        }

        return errors;
    }

    export const ValidatePassword = (password: string): string[] => {
    
        const MIN_PASSWORD_LENGTH = 12
        const errors: string[] = [];

        if(password.length < MIN_PASSWORD_LENGTH){
            errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
        }

        const passwordRegex = /^[\x21-\x7E]*$/;
        if (!passwordRegex.test(password)) {
            errors.push("Password contains invalid characters.");
        }

        return errors;

    }

}