export interface SuccessResult<T> {
    isSuccessful: true,
    value: T
}

export interface ErrorResult {
    isSuccessful: false,
    message: string
}


export type Result<T> = SuccessResult<T> | ErrorResult;