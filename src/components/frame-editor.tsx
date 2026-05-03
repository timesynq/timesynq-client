import { useCallback, useEffect } from "react";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { Toasts } from "@/utils/toasts";
import { Counter } from "./counter";
import { WIP_CONSTANTS } from "@/api/wips/wip";
import { FrameMetadata, TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { UpdateChannelMuteCommand, UpdateChannelSoloCommand, UpdateChannelTypeCommand, UpdateLineCountCommand, UpdateLinesPerBeatCommand } from "@/api/tracker/tracker-hub-commands";
import { ChannelHeader, ChannelLineNumbers, ChannelLineNumbersHeader, ChannelLines } from "./channel";
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelection } from "@/contexts/selection-provider";
import { channelCountAtom, currentFrameNumberAtom, frameMetadataAtomFamily, octaveAtom, setIndividualChannelMetadataAtom, setIndividualFrameMetadataAtom } from "@/atoms/tracker-atoms";
import { useAtom, useAtomValue } from "jotai";

export interface FrameEditorProps {
    client: TrackerHubClient;
}

export const FrameEditor = ({ client }: FrameEditorProps) => {
    
    const channelCount = useAtomValue(channelCountAtom);
    const frameNumber = useAtomValue(currentFrameNumberAtom);
    const frameMetadata = useAtomValue(frameMetadataAtomFamily(frameNumber));

    const [, setIndividualFrameMetadata] = useAtom(setIndividualFrameMetadataAtom);
    const [, setIndividualChannelMetadata] = useAtom(setIndividualChannelMetadataAtom);

    useEffect(() => {
        const lineCountUpdatedCallback = (command: UpdateLineCountCommand) => {
            setIndividualFrameMetadata({ index: command.frame, updater: (frameMetadata) => ({...frameMetadata, length: command.newLineCount})});
        }
        const unsubscribeLineCountUpdated = client.subscribeLineCountUpdated(lineCountUpdatedCallback);

        const linesPerBeatUpdatedCallback = (command: UpdateLinesPerBeatCommand) => {
            setIndividualFrameMetadata({ index: command.frame, updater: (frameMetadata) => ({...frameMetadata, linesPerBeat: command.newLinesPerBeat})});
        }
        const unsubscribeLinesPerBeatUpdated = client.subscribeLinesPerBeatUpdated(linesPerBeatUpdatedCallback);

        const channelTypeUpdatedCallback = (command: UpdateChannelTypeCommand) => {
            setIndividualChannelMetadata({ frameNumber: command.frame, channelNumber: command.channel, updater: (channelMetadata) => ({ ...channelMetadata, isSend: command.isSend })}); 
        }
        const unsubscribeChannelTypeUpdated = client.subscribeChannelTypeUpdated(channelTypeUpdatedCallback);

        const channelMuteUpdatedCallback = (command: UpdateChannelMuteCommand) => {
            setIndividualChannelMetadata({ frameNumber: command.frame, channelNumber: command.channel, updater: (channelMetadata) => ({ ...channelMetadata, isOn: command.isOn })});
        }
        const unsubscribeChannelMuteUpdated = client.subscribeChannelMuteUpdated(channelMuteUpdatedCallback);

        const channelSoloUpdatedCallback = (command: UpdateChannelSoloCommand) => {
            setIndividualChannelMetadata({ frameNumber: command.frame, channelNumber: command.channel, updater: (channelMetadata) => ({ ...channelMetadata, isSolo: command.isSolo })});
        }
        const unsubscribeChannelSoloUpdated = client.subscribeChannelSoloUpdated(channelSoloUpdatedCallback);

        return () => {
            unsubscribeLineCountUpdated();
            unsubscribeLinesPerBeatUpdated();
            unsubscribeChannelTypeUpdated();
            unsubscribeChannelMuteUpdated();
            unsubscribeChannelSoloUpdated();
        }
    }, [client, frameMetadata]);
    
    const setIsFocused = useSelection((state) => state.setIsFocused);

    return (
        <div className="flex flex-col w-full h-full min-h-0 bg-background-darker">
            <FrameEditorOptions 
                client={client}
                frameMetadata={frameMetadata}
            />
            <div className="flex flex-col h-full min-h-0 overflow-x-auto">
                <div className="min-w-max flex flex-col h-full">
                    <div className="flex flex-row w-full">
                        <ChannelLineNumbersHeader />
                        { Array.from({ length: channelCount }).map((_, index) => (
                            <ChannelHeader
                                client={client}
                                frameNumber={frameMetadata.frameNumber}
                                channelNumber={index}
                            />
                        ))}
                        <ChannelLineNumbersHeader />
                    </div>
                    <OutsideClickHandler 
                        display="contents"
                        onOutsideClick={() => setIsFocused(false)}
                    >
                        <div className="flex flex-row w-max min-w-full flex-1 overflow-y-auto" onClick={() => setIsFocused(true)}>
                            <ChannelLineNumbers
                                lineCount={frameMetadata.length}
                                linesPerBeat={frameMetadata.linesPerBeat}
                            />
                            { Array.from({ length: channelCount }).map((_, index) => (
                                <ChannelLines 
                                    client={client}
                                    frameNumber={frameMetadata.frameNumber}
                                    channelNumber={index}
                                    lineCount={frameMetadata.length}
                                    linesPerBeat={frameMetadata.linesPerBeat}
                                />
                            ))}
                            <ChannelLineNumbers 
                                lineCount={frameMetadata.length}
                                linesPerBeat={frameMetadata.linesPerBeat}
                                isRightHandSide
                            />
                        </div>
                    </OutsideClickHandler>
                </div>
            </div>
        </div>
    );
}

interface FrameEditorOptionsProps {
    client: TrackerHubClient;
    frameMetadata: FrameMetadata;
}

const FrameEditorOptions = ({ client, frameMetadata }: FrameEditorOptionsProps) => {

    const handleSetLineCount = useCallback(
        async (newLineCount: number) => {
            const result: TrackerHubResult<void> = await client.updateLineCount({
                frame: frameMetadata.frameNumber,
                newLineCount
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, frameMetadata]
    );

    const handleSetLinesPerBeat = useCallback(
        async (newLinesPerBeat: number) => {
            const result: TrackerHubResult<void> = await client.updateLinesPerBeat({
                frame: frameMetadata.frameNumber,
                newLinesPerBeat
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, frameMetadata]
    );

    const [octave, setOctave] = useAtom(octaveAtom);

    return(
        <div className="flex flex-row w-full justify-center items-center space-x-12 p-4 border-b">
            <Counter
                label="Lines"
                value={frameMetadata.length}
                min={WIP_CONSTANTS.MIN_LINES}
                max={WIP_CONSTANTS.MAX_LINES}
                onChange={handleSetLineCount}
            />
            <Counter
                label="LPB"
                value={frameMetadata.linesPerBeat}
                min={WIP_CONSTANTS.MIN_LINES_PER_BEAT}
                max={WIP_CONSTANTS.MAX_LINES_PER_BEAT}
                onChange={handleSetLinesPerBeat}
            />
            <Counter
                label="Octave"
                value={octave}
                min={WIP_CONSTANTS.MIN_OCTAVE}
                max={WIP_CONSTANTS.MAX_OCTAVE}
                onChange={setOctave}
            />
        </div>
    );
}