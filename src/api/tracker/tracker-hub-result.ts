export type TrackerHubResult<T> = {
    isSuccessful: boolean;
    errorMessage: string | null;
    value: T | null;
}