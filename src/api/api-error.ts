export type ApiError = {
    type: string,
    title: string,
    status: number,
    detail: string,
    instance: string,
}

export const UNEXPECTED_ERROR_MESSAGE = "Unexpected error. Please try again later.";