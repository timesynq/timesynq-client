export interface SuccessResult<T> {
    isSuccessful: true,
    value: T
}

export interface ErrorResult {
    isSuccessful: false,
    message: string
}

export type Result<T> = SuccessResult<T> | ErrorResult;

export const ResultFactory = {
    success: <T>(value : T): SuccessResult<T> => {
        return {
            isSuccessful: true,
            value: value,
        }
    },

    error: (message: string): ErrorResult => {
        return {
            isSuccessful: false,
            message: message
        }
    } 
}