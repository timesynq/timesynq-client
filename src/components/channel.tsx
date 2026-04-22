import { useState } from "react";
import { WIP_CONSTANTS } from "@/api/wips/wip";
import { NavigationCounter, NavigationCounterJustify } from "./navigation-counter";
import { Button } from "./ui/button";
import { Line } from "./line";
import { LineSpacer } from "./line-spacer";

export interface ChannelHeaderProps {
    frame: number;
    channel: number;
    isNoted: boolean;
}

export const ChannelHeader = ({ frame, channel, isNoted }: ChannelHeaderProps) => {

    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isSolo, setIsSolo] = useState<boolean>(false);
    const [noteGroupsOpen, setNoteGroupsOpen] = useState<number>(1);
    const [fxGroupsOpen, setFxGroupsOpen] = useState<number>(1);

    const isMaster: boolean = channel === 0; 

    return (
        <div className={`min-h-[190px] min-w-[170px] bg-background-darker p-4 flex flex-col space-y-2 border-b border-r`}>
            <p 
                className={
                    `flex justify-center items-center h-8 select-none
                    ${!isMaster && "cursor-pointer"} 
                    ${isMuted ? "bg-background-darker text-muted-foreground" : "bg-secondary text-foreground"}
                    `
                }
                onClick={() => !isMaster && setIsMuted(!isMuted)}    
            >
                {isMaster ? "Master" : `Channel ${channel}`}
            </p>
            <div className="flex flex-row justify-between items-center space-x-2">
                <Button
                    variant="secondary"
                    className={
                        `h-8 flex-1 rounded-none cursor-pointer 
                        ${isMaster && "invisible"} 
                        ${!isNoted && "bg-positive-background text-positive-foreground hover:bg-positive-background/75 hover:text-positive-foreground/75"}
                        `
                    }
                >
                    Send
                </Button>
                <Button
                    size="icon"
                    variant="secondary"
                    className={
                        `w-8 h-8 rounded-none cursor-pointer
                        ${isMaster && "invisible"} 
                        ${isSolo 
                            ? 
                            "bg-positive-background text-positive-foreground hover:bg-positive-background/75 hover:text-positive-foreground/75" :
                            "bg-negative-background text-negative-foreground hover:bg-negative-background/75 hover:text-negative-foreground/75"
                        }
                        `
                    }
                    onClick={() => setIsSolo(!isSolo)}
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
            { !isMaster && isNoted && 
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
    noteGroupsOpen: number;
    fxGroupsOpen: number;
}

export const ChannelLines = ({ frame, channel, isNoted, lineCount, linesPerBeat, noteGroupsOpen, fxGroupsOpen }: ChannelLinesProps) => {

    return (
        <div className="min-w-[170px] flex flex-col">
            <div className="flex flex-col flex-grow bg-background-darker">
                <LineSpacer />
                {Array.from({ length: lineCount }).map((_, i) => (
                    <Line
                        key={`${channel}:${i}`}
                        frame={frame}
                        channel={channel}
                        line={i}
                        isNoted={isNoted}
                        linesPerBeat={linesPerBeat}
                        noteGroupsOpen={noteGroupsOpen}
                        fxGroupsOpen={fxGroupsOpen}
                    />
                ))}
                <LineSpacer />
            </div>
        </div>
    );

}