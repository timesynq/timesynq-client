import { useState } from "react";
import { WIP_CONSTANTS } from "@/api/wips/wip";
import { NavigationCounter, NavigationCounterJustify } from "./navigation-counter";
import { Button } from "./ui/button";
import { Line } from "./line";
import { LineSpacer } from "./line-spacer";

export interface ChannelProps {
    label: number;
    isNoted: boolean; 
    lineCount: number;
    linesPerBeat: number;
    // scroll amount prop
}

export const Channel = ({ label, isNoted, lineCount, linesPerBeat }: ChannelProps) => {

    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isSolo, setIsSolo] = useState<boolean>(false);
    const [noteGroupsOpen, setNoteGroupsOpen] = useState<number>(1);
    const [fxGroupsOpen, setFxGroupsOpen] = useState<number>(1);

    const isMaster: boolean = label === 0; 

    return (
        <div className={`flex flex-col h-full min-h-0 border-r`}>
            <div className={`min-h-[190px] ${!isMaster && isNoted && "min-w-[175px]"} bg-background-darker p-4 flex flex-col space-y-2 border-b`}>
                <p 
                    className={
                        `flex justify-center items-center h-8 select-none
                        ${label !== 0 && "cursor-pointer"} 
                        ${isMuted ? "bg-background-darker text-muted-foreground" : "bg-secondary text-foreground"}
                        `
                    }
                    onClick={() => label !== 0 && setIsMuted(!isMuted)}    
                >
                    {isMaster ? "Master" : `Channel ${label}`}
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
            <div className="h-full bg-background-darker">
                <LineSpacer />
                {Array.from({ length: lineCount }).map((_, i) => (
                    <Line
                        label={i}
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