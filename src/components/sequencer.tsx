import { WIP_CONSTANTS } from "@/api/wips/wip";
import { Counter } from "./counter";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { useCallback, useEffect, useState } from "react";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { Toasts } from "@/utils/toasts";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { LineState, SequencerLine } from "./sequencer-line";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { UpdateSequencerChannelCommand, UpdateSequencerFrameCommand } from "@/api/tracker/tracker-hub-commands";

export interface SequencerProps {
    client: TrackerHubClient;
    channelCount: number;
} 

export const Sequencer = ({client, channelCount}: SequencerProps) => {
    
    const [length, setLength] = useState<number>(1 /*temporary, this will be read from the server*/);
    const handleSequencerLengthUpdate = async (newSequencerLength: number): Promise<void> => {
        const result: TrackerHubResult<void> = await client.updateSequencerLength(newSequencerLength);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }

    const [lineStates, setLineStates] = useState<LineState[]>(
        new Array(WIP_CONSTANTS.MAX_SEQUENCER_LENGTH)
            .fill(null)
            .map(() => ({
                frame: 0,
                isChannelOn: new Array(WIP_CONSTANTS.MAX_CHANNELS).fill(true)
            }))
    );

    const handleSequencerFrameUpdate = async (command: UpdateSequencerFrameCommand): Promise<void> => {
        const result: TrackerHubResult<void> = await client.updateSequencerFrame(command);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }
    const handleSetFrame = useCallback((line: number) => (newFrame: number) => {
        handleSequencerFrameUpdate({line: line, newFrame: newFrame});
    }, [handleSequencerFrameUpdate])

    const handleSequencerChannelUpdate = async (command: UpdateSequencerChannelCommand): Promise<void> => {
        const result: TrackerHubResult<void> = await client.updateSequencerChannel(command);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }
    const handleSetChannel = useCallback((line: number) => (channel: number, isOn: boolean) => {
        handleSequencerChannelUpdate({line: line, channel: channel + 1, isOn: isOn})
    }, [handleSequencerChannelUpdate]);

    useEffect(() => {

        const sequencerLengthUpdatedCallback = (newSequencerLength: number) => {
            setLength(newSequencerLength);
        }
        const unsubscribeSequencerLengthUpdated = client.subscribeSequencerLengthUpdated(sequencerLengthUpdatedCallback);

        const sequencerFrameUpdatedCallback = (command: UpdateSequencerFrameCommand) => {
            setLineStates(prev => {
                const currentLineState = prev[command.line];

                const updated = [...prev];
                updated[command.line] = {
                    frame: command.newFrame,
                    isChannelOn: currentLineState.isChannelOn
                };

                return updated;
            });
        }
        const unsubscribeSequencerFrameUpdated = client.subscribeSequencerFrameUpdated(sequencerFrameUpdatedCallback);
        
        const sequencerChannelUpdatedCallback = (command: UpdateSequencerChannelCommand) => {
            setLineStates(prev => {
                const currentLineState = prev[command.line];
                const newChannelStates = [...currentLineState.isChannelOn];
                newChannelStates[command.channel - 1] = command.isOn;

                const updated = [...prev];
                updated[command.line] = {
                    frame: currentLineState.frame,
                    isChannelOn: newChannelStates
                };

                return updated;
            });
        }
        const unsubscribeSequencerChannelUpdated = client.subscribeSequencerChannelUpdated(sequencerChannelUpdatedCallback);

        return () => {
            unsubscribeSequencerLengthUpdated();
            unsubscribeSequencerFrameUpdated();
            unsubscribeSequencerChannelUpdated();
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
                            setFrame={handleSetFrame(index)}
                            setChannel={handleSetChannel(index)}
                        />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="mb-1" />
            </ScrollArea>
        </div>
    );  
}