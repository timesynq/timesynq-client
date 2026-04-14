import { WIP_CONSTANTS } from "@/api/wips/wip";
import { Counter } from "./counter";
import { toTwoDigitHex } from "@/utils/hex";
import { Button } from "./ui/button";

export type LineState = {
    frame: number;
    channelMuteStates: boolean[];
}

export const defaultLineState: LineState = {
    frame: 0,
    channelMuteStates: new Array(WIP_CONSTANTS.MAX_CHANNELS).fill(true)
}

export interface SequencerLineProps {
    line: number,
    state: LineState,
    channelCount: number,
    setFrame: (newFrame: number) => void,
} 

export const SequencerLine = ({line, state, channelCount, setFrame}: SequencerLineProps) => {
    return(
        <div className="flex flex-row space-x-4">
            <Counter
                label={toTwoDigitHex(line)}
                value={state.frame}
                min={WIP_CONSTANTS.MIN_PATTERN}
                max={WIP_CONSTANTS.MAX_PATTERN}
                onChange={setFrame}
                displayHex
            />
            <div className="flex flex-row space-x-1">
                { 
                    state.channelMuteStates.map((unmuted, index) => (
                        <ChannelToggleButton 
                            unmuted={unmuted}
                            disabled={index >= channelCount}
                        />
                    ))
                }
            </div>
        </div>
    );
}

interface ChannelToggleButtonProps {
    unmuted: boolean;
    disabled: boolean;
}

const ChannelToggleButton = ({unmuted, disabled}: ChannelToggleButtonProps) => {
    return (
        <Button
            size="icon"
            variant={disabled ? "secondary" : unmuted ? "positive" : "negative"}
            className={`${!disabled && "cursor-pointer"} w-8 h-8 rounded-none border ${disabled && "hover:bg-muted"}`}
        />
    );
}