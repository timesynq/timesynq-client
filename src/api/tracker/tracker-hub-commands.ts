export type UpdateSequencerFrameCommand = {
    line: number;
    newFrame: number;
}

export type UpdateSequencerChannelCommand = {
    line: number;
    channel: number;
    isOn: boolean;
}

export type UpdateLineCountCommand = {
    frame: number;
    newLineCount: number;
}

export type UpdateLinesPerBeatCommand = {
    frame: number;
    newLinesPerBeat: number;
}

export type UpdateChannelTypeCommand = {
    frame: number;
    channel: number;
    isSend: boolean;
}

export type UpdateChannelMuteCommand = {
    frame: number;
    channel: number;
    isOn: boolean;
}

export type UpdateChannelSoloCommand = {
    frame: number;
    channel: number;
    isSolo: boolean;
}