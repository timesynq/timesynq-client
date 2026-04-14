export type UpdateSequencerFrameCommand = {
    line: number;
    newFrame: number;
}

export type UpdateSequencerChannelCommand = {
    line: number;
    channel: number;
    isOn: boolean;
}