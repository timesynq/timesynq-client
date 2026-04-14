import { WIP_CONSTANTS } from "@/api/wips/wip";
import { Counter } from "./counter";
import { toTwoDigitHex } from "@/utils/hex";
import { Button } from "./ui/button";

export type LineState = {
    frame: number;
    isChannelOn: boolean[];
}

export interface SequencerLineProps {
    line: number,
    state: LineState,
    channelCount: number,
    setFrame: (newFrame: number) => void,
    setChannel: (channel: number, isOn: boolean) => void,
} 

export const SequencerLine = ({line, state, channelCount, setFrame, setChannel}: SequencerLineProps) => {

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
                    state.isChannelOn.map((isOn, index) => (
                        <ChannelToggleButton
                            isOn={isOn}
                            disabled={index >= channelCount}
                            channel={index}
                            toggle={setChannel}
                        />
                    ))
                }
            </div>
        </div>
    );
}

interface ChannelToggleButtonProps {
    isOn: boolean;
    disabled: boolean;
    channel: number;
    toggle: (channel: number, isOn: boolean) => void;
}

const ChannelToggleButton = ({isOn, disabled, channel, toggle}: ChannelToggleButtonProps) => {
    return (
        <Button
            size="icon"
            variant={disabled ? "secondary" : isOn ? "positive" : "negative"}
            className={`${!disabled && "cursor-pointer"} w-8 h-8 rounded-none border ${disabled && "hover:bg-muted"}`}
            onClick={() => {
                if (disabled) return;
                toggle(channel, !isOn)
            }}
        />
    );
}