import { Wip } from "../wips/wip";

export type TrackerHubResult<T> = {
    isSuccessful: boolean;
    errorMessage: string | null;
    value: T | null;
}

export type Message = {
    color: string;
    username: string;
    message: string;
}

export type RoomMember = {
    userId: string,
    userName: string,
    connectionId: string,
}

export type ChatMessage = {
    userId: string,
    message: string,
}

export type TrackerConnection = {
    userId: string,
    connectionId: string,
}

export type RoomInitializer = {
    wip: Wip,
    members: RoomMember[],
    bpm: number,
    channelCount: number,
    sequencer: Sequencer,
    frames: Frame[]
}

export type Sequencer = {
    frames: number,
    lines: SequencerLine[],
}

export type SequencerLine = {
    line: number,
    frame: number,
    channelStates: boolean[],
}

export type Frame = {
    frame: number,
    lines: number,
    linesPerBeat: number,
    channels: Channel[],
}

export type Channel = {
    channel: number,
    isSend: boolean,
    isOn: boolean,
    isSolo: boolean,
    lines: Line[],
}

export type Line = {
    line: number,
    pitches: number[],
    instruments: number[],
    fxSymbols: number[],
    fxValues: number[],
}