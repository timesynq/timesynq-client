import { WIP_CONSTANTS } from "@/api/wips/wip";
import { Counter } from "./counter";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { useEffect, useState } from "react";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { Toasts } from "@/utils/toasts";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { defaultLineState, LineState, SequencerLine } from "./sequencer-line";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export interface SequencerProps {
    client: TrackerHubClient;
    channelCount: number;
} 

export const Sequencer = ({client, channelCount}: SequencerProps) => {
    
    const [length, setLength] = useState<number>(256 /*temporary, this will be read from the server*/);
    const handleSequencerLengthUpdate = async (newSequencerLength: number): Promise<void> => {
        const result: TrackerHubResult<void> = await client.updateSequencerLength(newSequencerLength);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }

    const [lineStates, setLineStates] = useState<LineState[]>(
        new Array(WIP_CONSTANTS.MAX_SEQUENCER_LENGTH)
            .fill(defaultLineState)
    );

    useEffect(() => {
        const callback = (newSequencerLength: number) => {
            setLength(newSequencerLength);
        }
        const unsubscribeSequencerLengthUpdated = client.onSequencerLengthUpdated(callback);
        return () => {
            unsubscribeSequencerLengthUpdated();
        }
    }, []);

    return (
        <div className="flex flex-col w-full space-y-4 h-full min-h-0 pt-4">
            <Counter 
                label="Frames"
                value={length}
                min={WIP_CONSTANTS.MIN_SEQUENCER_LENGTH}
                max={WIP_CONSTANTS.MAX_SEQUENCER_LENGTH}
                onChange={handleSequencerLengthUpdate}
            />
            <ScrollArea className="h-full pb-4 pl-4 pr-4">
                <div className="flex flex-col justify-start items-start space-y-2 overflow-auto">
                    { lineStates.map((line, index) => (
                        index < length && 
                        <SequencerLine 
                            line={index}
                            state={line}
                            channelCount={channelCount}
                            setPattern={()=>{}}
                        />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="mb-1" />
            </ScrollArea>
        </div>
    );  
}