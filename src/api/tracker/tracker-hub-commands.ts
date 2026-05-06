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

// "type" fields are used as discriminants
export type UpdatePitchCommand = {
    type: "pitch";
    frame: number;
    channel: number;
    line: number;
    noteGroup: number;
    newPitch: number | null;
}

export type UpdateInstrumentCommand = {
    type: "instrument";
    frame: number;
    channel: number;
    line: number;
    noteGroup: number;
    newInstrument: number | null;
}

export type UpdateFXSymbolCommand = {
    type: "fxSymbol";
    frame: number;
    channel: number;
    line: number;
    fxGroup: number;
    newFXSymbol: number | null;
}

export type UpdateFXValueCommand = {
    type: "fxValue";
    frame: number;
    channel: number;
    line: number;
    fxGroup: number;
    newFXValue: number | null;
}

export type LineUpdateCommand = UpdatePitchCommand | UpdateInstrumentCommand | UpdateFXSymbolCommand | UpdateFXValueCommand;