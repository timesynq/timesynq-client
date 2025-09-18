export type ApiError = {
    type: string,
    title: string,
    status: number,
    detail: string,
    instance: string,
}

export const ApiErrorFactory = {

    createFetchError: (error: unknown, instance: string): ApiError => {

        return {
            type: "FetchError",
            title: "Unexpected error occurred",
            status: 500,
            detail: (error instanceof Error ? error.message : "Unknown error"),
            instance: instance,
        };

    }

}