import { WIP_CONSTANTS } from "@/api/wips/wip";
import { Counter } from "./counter";
import { toTwoDigitHex } from "@/utils/hex";
import { Button } from "./ui/button";
import { useMemo } from "react";
import { channelCountAtom, currentSequencerLineAtom, individualSequencerLinesAtom, isSequencerLineSelectedAtom } from "@/atoms/tracker-atoms";
import { useAtomValue, useSetAtom } from "jotai";

export interface SequencerLineControlsProps {
    line: number;
    setFrame: (newFrame: number) => void,
    setChannel: (channel: number, isOn: boolean) => void,
} 

export const SequencerLineControls = ({ line, setFrame, setChannel }: SequencerLineControlsProps) => {

    const channelCount = useAtomValue(channelCountAtom);
    const lineAtoms = useAtomValue(individualSequencerLinesAtom);
    const lineState = useAtomValue(lineAtoms[line]);
    const isSelected = useAtomValue(isSequencerLineSelectedAtom(line));
    const setCurrentSequencerLine = useSetAtom(currentSequencerLineAtom);

    return(
        <div className={`flex flex-row space-x-4 border-2 border-background ${!isSelected && "hover:border-secondary"} ${isSelected && "border-negative-background"} pl-3 pr-1 py-1`}
            onClick={() => setCurrentSequencerLine(line)}
        >
            <Counter
                label={toTwoDigitHex(line)}
                value={lineState.frame}
                min={WIP_CONSTANTS.MIN_PATTERN}
                max={WIP_CONSTANTS.MAX_PATTERN}
                onChange={setFrame}
                displayHex
            />
            <div className="flex flex-row space-x-1">
                { 
                    lineState.isChannelOn.map((isOn, index) => (
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

export const SequencerInfoLine = () => {

    const channelCount = useAtomValue(channelCountAtom);

    const channelNums: string[] = useMemo(() => 
        Array.from({ length: WIP_CONSTANTS.MAX_CHANNELS }, (_, i) => toTwoDigitHex(i)), []
    );

    return (
        <div className="flex flex-row space-x-4 pl-3 pr-1 border-2 border-background">
            <div className="invisible">
                <Counter
                    label="00"
                    value={0}
                    min={0}
                    max={0}
                    onChange={() => {}}
                />
            </div>
            <div className="flex flex-row space-x-1">
                {
                    channelNums.map((label, index) => (
                        <span 
                            className={`${index >= channelCount ? "text-input" : "text-foreground"} w-8 h-8 flex items-center justify-center`}
                        >
                            {label}
                        </span>
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
            variant={disabled ? "outline" : isOn ? "secondary" : "negative"}
            className={`${!disabled && "cursor-pointer"} w-8 h-8 rounded-none border ${disabled && "hover:bg-dark"}`}
            onClick={() => {
                if (disabled) return;
                toggle(channel, !isOn)
            }}
        />
    );
}