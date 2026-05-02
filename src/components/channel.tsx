import { useCallback, useMemo, useState } from "react";
import { WIP_CONSTANTS } from "@/api/wips/wip";
import { NavigationCounter, NavigationCounterJustify } from "./navigation-counter";
import { Button } from "./ui/button";
import { Line } from "./line";
import { LineSpacer } from "./line-spacer";
import { toTwoDigitHex } from "@/utils/hex";
import { useSelection } from "@/contexts/selection-provider";
import { useAtomValue } from "jotai";
import { channelMetadataAtomFamily } from "@/atoms/tracker-atoms";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { Toasts } from "@/utils/toasts";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";

const MIN_HEADER_H = "min-h-[190px]";
const MIN_CHANNEL_W = "min-w-[170px]";
const MIN_NUMBERS_W = "min-w-[38px]";

export interface ChannelHeaderProps {
    client: TrackerHubClient;
    frameNumber: number;
    channelNumber: number;
}

export const ChannelHeader = ({ client, frameNumber, channelNumber }: ChannelHeaderProps) => {

    const params = useMemo(
        () => ({ frameNumber, channelNumber }),
        [frameNumber, channelNumber]
    )
    const channelMetadata = useAtomValue(channelMetadataAtomFamily(params));

    const [noteGroupsOpen, setNoteGroupsOpen] = useState<number>(1);
    const [fxGroupsOpen, setFxGroupsOpen] = useState<number>(1);

    const isMaster: boolean = channelNumber === 0; 
    const isNoted: boolean = !isMaster && !channelMetadata.isSend;

    const handleSetChannelType = useCallback(
        async (isSend: boolean) => {
            const result: TrackerHubResult<void> = await client.updateChannelType({
                frame: frameNumber,
                channel: channelNumber,
                isSend: isSend,
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, frameNumber, channelNumber]
    );

    const handleSetChannelMute = useCallback(
        async (isOn: boolean) => {
            const result: TrackerHubResult<void> = await client.updateChannelMute({
                frame: frameNumber,
                channel: channelNumber,
                isOn: isOn,
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, frameNumber, channelNumber]
    );

    const handleSetChannelSolo = useCallback(
        async (isSolo: boolean) => {
            const result: TrackerHubResult<void> = await client.updateChannelSolo({
                frame: frameNumber,
                channel: channelNumber,
                isSolo: isSolo,
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, frameNumber, channelNumber]
    );

    return (
        <div className={`${MIN_HEADER_H} ${MIN_CHANNEL_W} bg-background-darker p-4 flex flex-col space-y-2 border-b border-r`}>
            <p 
                className={
                    `flex justify-center items-center h-8 select-none
                    ${!isMaster && "cursor-pointer"} 
                    ${!channelMetadata.isOn ? "bg-background-darker text-muted-foreground" : "bg-secondary text-foreground"}
                    `
                }
                onClick={() => !isMaster && handleSetChannelMute(!channelMetadata.isOn)}    
            >
                {isMaster ? "Master" : `Channel ${channelNumber}`}
            </p>
            <div className="flex flex-row justify-between items-center space-x-2">
                <Button
                    variant="secondary"
                    className={
                        `h-8 flex-1 rounded-none cursor-pointer 
                        ${isMaster && "invisible"} 
                        ${channelMetadata.isSend && "bg-positive-background text-positive-foreground hover:bg-positive-background/75 hover:text-positive-foreground/75"}
                        `
                    }
                    onClick={() => handleSetChannelType(!channelMetadata.isSend)}
                >
                    Send
                </Button>
                <Button
                    size="icon"
                    variant="secondary"
                    className={
                        `w-8 h-8 rounded-none cursor-pointer
                        ${isMaster && "invisible"} 
                        ${channelMetadata.isSolo 
                            ? 
                            "bg-positive-background text-positive-foreground hover:bg-positive-background/75 hover:text-positive-foreground/75" :
                            "bg-negative-background text-negative-foreground hover:bg-negative-background/75 hover:text-negative-foreground/75"
                        }
                        `
                    }
                    onClick={() => handleSetChannelSolo(!channelMetadata.isSolo)}
                >
                    S
                </Button>
            </div>
            <NavigationCounter 
                label="FX"
                value={fxGroupsOpen}
                min={WIP_CONSTANTS.MIN_FX_GROUPS}
                max={WIP_CONSTANTS.MAX_FX_GROUPS}
                onChange={setFxGroupsOpen}
                justify={NavigationCounterJustify.Between}
            />
            { isNoted && 
                <NavigationCounter 
                    label="Notes"
                    value={noteGroupsOpen}
                    min={WIP_CONSTANTS.MIN_NOTE_GROUPS}
                    max={WIP_CONSTANTS.MAX_NOTE_GROUPS}
                    onChange={setNoteGroupsOpen}
                    justify={NavigationCounterJustify.Between}
                />
            }
            
        </div>
    );

}

export interface ChannelLinesProps extends ChannelHeaderProps {
    lineCount: number;
    linesPerBeat: number;
}

export const ChannelLines = ({ client, frameNumber, channelNumber, lineCount, linesPerBeat }: ChannelLinesProps) => {

    const channel = useAtomValue(channelMetadataAtomFamily({ frameNumber, channelNumber }));
    const isMaster: boolean = channelNumber === 0; 
    const isNoted: boolean = !isMaster && !channel.isSend;

    return (
        <div className={`${MIN_CHANNEL_W} flex flex-col`}>
            <div className="flex flex-col flex-grow bg-background-darker">
                <LineSpacer />
                {Array.from({ length: lineCount }).map((_, i) => (
                    <Line
                        key={`${channelNumber}:${i}`}
                        frame={frameNumber}
                        channel={channelNumber}
                        line={i}
                        isNoted={isNoted}
                        linesPerBeat={linesPerBeat}
                        noteGroupsOpen={1}
                        fxGroupsOpen={1}
                    />
                ))}
                <LineSpacer />
            </div>
        </div>
    );

}

export const ChannelLineNumbersHeader = () => {
    return(
        <div className={`${MIN_HEADER_H} ${MIN_NUMBERS_W} border-b border-r`} />
    );
}

export interface ChannelLineNumbersProps {
    lineCount: number;
    linesPerBeat: number;
    isRightHandSide?: boolean;
}

export const ChannelLineNumbers = ({ lineCount, linesPerBeat, isRightHandSide = false }: ChannelLineNumbersProps) => {
    
    return (
        <div className={`${MIN_NUMBERS_W} flex flex-col`}>
            <div className="flex flex-col flex-grow">
                <LineSpacer />
                {Array.from({ length: lineCount}, (_, i) => (
                    <LineNumber
                        key={i}
                        lineNumber={i}
                        isDownbeat={i % linesPerBeat === 0}
                        isRightHandSide={isRightHandSide}
                    />
                ))}
                <LineSpacer />
            </div>
        </div>
    );

}

interface LineNumberProps {
    lineNumber: number;
    isDownbeat: boolean;
    isRightHandSide: boolean;
}

const LineNumber = ({ lineNumber, isDownbeat, isRightHandSide }: LineNumberProps) => {

    const isLineSelected = useSelection((state) => state.selection?.line === lineNumber);
    const isFocusedAndSelected = useSelection((state) => state.isFocused && isLineSelected);

    let bgColor = "bg-background-darker";
    let border = "border-r";
    let textColor = "text-muted-foreground";
    if (isFocusedAndSelected){
        bgColor = "bg-negative-background";
        if (!isRightHandSide)
            border = "border-r-negative-foreground/30";
        textColor = "text-negative-foreground";
    }
    else if (isLineSelected){
        bgColor = "bg-input";
        if (isDownbeat)
            textColor = "text-foreground";
    }
    else if (isDownbeat){
        bgColor = "bg-secondary";
        textColor = "text-foreground";
    }

    return(
        <div 
            className={
                `h-[32px] flex justify-center items-center py-1 select-none border-r
                ${bgColor} ${border} ${textColor}
                `
            }
        >
            {toTwoDigitHex(lineNumber)}
        </div>
    )
}