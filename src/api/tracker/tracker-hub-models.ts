import { Wip } from "../wips/wip";

export type TrackerHubResult<T> = {
    isSuccessful: boolean;
    errorMessage: string | null;
    value: T | null;
}

export type RoomMember = {
    userId: string,
    userName: string,
    connectionId: string,
}

export type RoomInitializer = {
    wip: Wip,
    members: RoomMember[],
}