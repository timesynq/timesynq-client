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

export type RoomMemberInfo = {
    userName: string,
    connectionIds: Set<string>,
    chatColor: string,
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
    length: number,
    lines: SequencerLine[],
}

export type SequencerLine = {
    lineNumber: number,
    frameNumber: number,
    isChannelOn: boolean[],
}

export type Frame = {
    frameNumber: number,
    length: number,
    linesPerBeat: number,
    channels: Channel[],
}

export type Channel = {
    channelNumber: number,
    isSend: boolean,
    isOn: boolean,
    isSolo: boolean,
    lines: Line[],
}

export type Line = {
    lineNumber: number,
    pitches: (number | null)[] | null, 
    instruments: (number | null)[] | null,
    fxSymbols: (number | null)[] | null,
    fxValues: (number | null)[] | null,
}

export const EXAMPLE_ROOM_INITIALIZER: RoomInitializer = {
    wip: {
        id: "example-guid",
        name: "example name",
        ownerId: "example-owner-guid",
        createdOnUTC: new Date(),
        lastOpenedOnUTC: new Date(),
    },
    bpm: 150,
    channelCount: 3,
    members: [],
    sequencer: {
        length: 5,
        lines: [
            {
                lineNumber: 0,
                frameNumber: 1,
                isChannelOn: [true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
            },
            {
                lineNumber: 1,
                frameNumber: 1,
                isChannelOn: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
            },
            {
                lineNumber: 3,
                frameNumber: 2,
                isChannelOn: [true, true, false, false, true, true, true, true, true, true, true, true, true, true, true, true]
            },
        ]
    },
    frames: [
        {
            frameNumber: 0,
            length: 64,
            linesPerBeat: 4,
            channels: [
                {
                    channelNumber: 0,
                    isSend: false,
                    isOn: true,
                    isSolo: false,
                    lines: [
                        {
                            lineNumber: 0,
                            pitches: [36, null, null],
                            instruments: [0, null, null],
                            fxSymbols: null,
                            fxValues: null,
                        },
                        {
                            lineNumber: 1,
                            pitches: [54, 21, 55],
                            instruments: [1, 1, null],
                            fxSymbols: [0, 0, null, null],
                            fxValues: [40, 40, 40, null],
                        }
                    ]
                },
                {
                    channelNumber: 1,
                    isSend: false,
                    isOn: true,
                    isSolo: false,
                    lines: []
                },
                {
                    channelNumber: 2,
                    isSend: false,
                    isOn: true,
                    isSolo: false,
                    lines: [
                        {
                            lineNumber: 63,
                            pitches: [22, 26, 28],
                            instruments: null,
                            fxSymbols: [2, 0, 3, null],
                            fxValues: [20, 20, null, null],
                        }
                    ]
                },
            ]
        },
        {
            frameNumber: 1,
            length: 32,
            linesPerBeat: 8,
            channels: []
        },
        {
            frameNumber: 2,
            length: 16,
            linesPerBeat: 2,
            channels: [
                {
                    channelNumber: 0,
                    isSend: false,
                    isOn: true,
                    isSolo: false,
                    lines: [
                        { // a line like this should never be sent back from the server
                            lineNumber: 5, 
                            pitches: null,
                            instruments: null,
                            fxSymbols: null,
                            fxValues: null,
                        }
                    ]
                },
                {
                    channelNumber: 2,
                    isSend: true,
                    isOn: false,
                    isSolo: true,
                    lines: []
                }
            ]
        }
    ]
}