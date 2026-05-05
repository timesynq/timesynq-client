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

export type UpdatePitchCommand = {
    frame: number;
    channel: number;
    line: number;
    noteGroup: number;
    newPitch: number | null;
}

export type UpdateInstrumentCommand = {
    frame: number;
    channel: number;
    line: number;
    noteGroup: number;
    newInstrument: number | null;
}

export type UpdateFXSymbolCommand = {
    frame: number;
    channel: number;
    line: number;
    fxGroup: number;
    newFXSymbol: number | null;
}

export type UpdateFXValueCommand = {
    frame: number;
    channel: number;
    line: number;
    fxGroup: number;
    newFXValue: number | null;
}