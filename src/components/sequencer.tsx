import { WIP_CONSTANTS } from "@/api/wips/wip";
import { Counter } from "./counter";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { useCallback, useEffect, useRef } from "react";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { Toasts } from "@/utils/toasts";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { SequencerInfoLine, SequencerLineControls } from "./sequencer-line-controls";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { UpdateSequencerChannelCommand, UpdateSequencerFrameCommand } from "@/api/tracker/tracker-hub-commands";
import { useAtom } from "jotai";
import { sequencerLengthAtom, setIndividualSequencerLineAtom } from "@/atoms/tracker-atoms";

export interface SequencerProps {
    client: TrackerHubClient;
} 

export const Sequencer = ({ client }: SequencerProps) => {

    const [sequencerLength, setSequencerLength] = useAtom(sequencerLengthAtom);
    const [, setIndividualSequencerLine] = useAtom(setIndividualSequencerLineAtom);

    const handleSequencerLengthUpdate = useCallback(async (newSequencerLength: number): Promise<void> => {
        const result: TrackerHubResult<void> = await client.updateSequencerLength(newSequencerLength);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }, [client]);

    const handleSequencerFrameUpdate = useCallback(async (command: UpdateSequencerFrameCommand): Promise<void> => {
        const result: TrackerHubResult<void> = await client.updateSequencerFrame(command);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }, [client]);
    const frameHandlerCache = useRef<Map<number, (newFrame: number) => void>>(new Map());
    const getFrameHandler = useCallback((line: number) => {
        if (!frameHandlerCache.current.has(line)) {
            frameHandlerCache.current.set(line, (newFrame: number) => {
                handleSequencerFrameUpdate({ line, newFrame });
            });
        }
        return frameHandlerCache.current.get(line)!;
    }, [handleSequencerFrameUpdate]);

    const handleSequencerChannelUpdate = useCallback(async (command: UpdateSequencerChannelCommand): Promise<void> => {
        const result: TrackerHubResult<void> = await client.updateSequencerChannel(command);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }, [client]);
    const channelHandlerCache = useRef<Map<number, (channel: number, isOn: boolean) => void>>(new Map());
    const getChannelHandler = useCallback((line: number) => {
        if (!channelHandlerCache.current.has(line)){
            channelHandlerCache.current.set(line, (channel: number, isOn: boolean) => {
                handleSequencerChannelUpdate({ line, channel: channel + 1, isOn});
            });
        }
        return channelHandlerCache.current.get(line)!;
    }, [handleSequencerChannelUpdate]);

    useEffect(() => {

        const sequencerLengthUpdatedCallback = (newSequencerLength: number) => {
            setSequencerLength(newSequencerLength);
        }
        const unsubscribeSequencerLengthUpdated = client.subscribeSequencerLengthUpdated(sequencerLengthUpdatedCallback);

        const sequencerFrameUpdatedCallback = (command: UpdateSequencerFrameCommand) => {
            setIndividualSequencerLine({ index: command.line, updater: (line) => ({...line, frame: command.newFrame })});
        }
        const unsubscribeSequencerFrameUpdated = client.subscribeSequencerFrameUpdated(sequencerFrameUpdatedCallback);
        
        const sequencerChannelUpdatedCallback = (command: UpdateSequencerChannelCommand) => {
            setIndividualSequencerLine({ index: command.line, updater: (line) => {
                const newChannelStates: boolean[] = [...line.isChannelOn];
                newChannelStates[command.channel - 1] = command.isOn;
                return {
                    ...line,
                    isChannelOn: newChannelStates
                }
            }})
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
                value={sequencerLength}
                min={WIP_CONSTANTS.MIN_SEQUENCER_LENGTH}
                max={WIP_CONSTANTS.MAX_SEQUENCER_LENGTH}
                onChange={handleSequencerLengthUpdate}
            />
            <ScrollArea className="h-full pb-4 pl-4 pr-4">
                <div className="flex flex-col justify-start items-start  overflow-auto">
                    <SequencerInfoLine />
                    { Array.from({ length: sequencerLength }).map((_, index) => (
                        index < sequencerLength && 
                        <SequencerLineControls 
                            line={index}
                            setFrame={getFrameHandler(index)}
                            setChannel={getChannelHandler(index)}
                        />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="mb-1" />
            </ScrollArea>
        </div>
    );  
}