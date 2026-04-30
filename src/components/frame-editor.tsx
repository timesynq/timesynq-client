import { useCallback, useEffect } from "react";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { Toasts } from "@/utils/toasts";
import { Counter } from "./counter";
import { WIP_CONSTANTS } from "@/api/wips/wip";
import { Frame, TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { UpdateChannelMuteCommand, UpdateChannelSoloCommand, UpdateChannelTypeCommand, UpdateLineCountCommand, UpdateLinesPerBeatCommand } from "@/api/tracker/tracker-hub-commands";
import { ChannelHeader, ChannelLineNumbers, ChannelLineNumbersHeader, ChannelLines } from "./channel";
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelection } from "@/contexts/selection-provider";
import { channelCountAtom, currentFrameNumberAtom, frameAtomFamily, octaveAtom, setIndividualChannelAtom, setIndividualFrameAtom } from "@/atoms/tracker-atoms";
import { useAtom, useAtomValue } from "jotai";

export interface FrameEditorProps {
    client: TrackerHubClient;
}

export const FrameEditor = ({ client }: FrameEditorProps) => {
    
    const channelCount = useAtomValue(channelCountAtom);
    const frameNumber = useAtomValue(currentFrameNumberAtom);
    const frame = useAtomValue(frameAtomFamily(frameNumber));

    const [, setIndividualFrame] = useAtom(setIndividualFrameAtom);
    const [, setIndividualChannel] = useAtom(setIndividualChannelAtom);

    useEffect(() => {
        const lineCountUpdatedCallback = (command: UpdateLineCountCommand) => {
            setIndividualFrame({ index: command.frame, updater: (frame) => ({...frame, length: command.newLineCount})});
        }
        const unsubscribeLineCountUpdated = client.subscribeLineCountUpdated(lineCountUpdatedCallback);

        const linesPerBeatUpdatedCallback = (command: UpdateLinesPerBeatCommand) => {
                setIndividualFrame({ index: command.frame, updater: (frame) => ({...frame, linesPerBeat: command.newLinesPerBeat})});
        }
        const unsubscribeLinesPerBeatUpdated = client.subscribeLinesPerBeatUpdated(linesPerBeatUpdatedCallback);

        const channelTypeUpdatedCallback = (command: UpdateChannelTypeCommand) => {
            setIndividualChannel({ frameNumber: command.frame, channelNumber: command.channel, updater: (channel) => ({ ...channel, isSend: command.isSend })}); 
        }
        const unsubscribeChannelTypeUpdated = client.subscribeChannelTypeUpdated(channelTypeUpdatedCallback);

        const channelMuteUpdatedCallback = (command: UpdateChannelMuteCommand) => {
            setIndividualChannel({ frameNumber: command.frame, channelNumber: command.channel, updater: (channel) => ({ ...channel, isOn: command.isOn })});
        }
        const unsubscribeChannelMuteUpdated = client.subscribeChannelMuteUpdated(channelMuteUpdatedCallback);

        const channelSoloUpdatedCallback = (command: UpdateChannelSoloCommand) => {
            setIndividualChannel({ frameNumber: command.frame, channelNumber: command.channel, updater: (channel) => ({ ...channel, isSolo: command.isSolo })});
        }
        const unsubscribeChannelSoloUpdated = client.subscribeChannelSoloUpdated(channelSoloUpdatedCallback);

        return () => {
            unsubscribeLineCountUpdated();
            unsubscribeLinesPerBeatUpdated();
            unsubscribeChannelTypeUpdated();
            unsubscribeChannelMuteUpdated();
            unsubscribeChannelSoloUpdated();
        }
    }, [client, frame]);
    
    const setIsFocused = useSelection((state) => state.setIsFocused);

    return (
        <div className="flex flex-col w-full h-full min-h-0 bg-background-darker">
            <FrameEditorOptions 
                client={client}
                frame={frame}
            />
            <div className="flex flex-col h-full min-h-0">
                <div className="flex flex-row w-full">
                    <ChannelLineNumbersHeader />
                    { Array.from({ length: channelCount }).map((_, index) => (
                        <ChannelHeader
                            client={client}
                            frameNumber={frame.frameNumber}
                            channelNumber={index}
                        />
                    ))}
                    <ChannelLineNumbersHeader />
                </div>
                <OutsideClickHandler 
                    display="contents"
                    onOutsideClick={() => setIsFocused(false)}
                >
                    <div className="flex flex-row w-full overflow-y-auto" onClick={() => setIsFocused(true)}>
                        <ChannelLineNumbers
                            lineCount={frame.length}
                            linesPerBeat={frame.linesPerBeat}
                        />
                        { Array.from({ length: channelCount }).map((_, index) => (
                            <ChannelLines 
                                client={client}
                                frameNumber={frame.frameNumber}
                                channelNumber={index}
                                lineCount={frame.length}
                                linesPerBeat={frame.linesPerBeat}
                            />
                        ))}
                        <ChannelLineNumbers 
                            lineCount={frame.length}
                            linesPerBeat={frame.linesPerBeat}
                            isRightHandSide
                        />
                    </div>
                </OutsideClickHandler>
            </div>
        </div>
    );
}

interface FrameEditorOptionsProps {
    client: TrackerHubClient;
    frame: Frame;
}

const FrameEditorOptions = ({ client, frame }: FrameEditorOptionsProps) => {

    const handleSetLineCount = useCallback(
        async (newLineCount: number) => {
            const result: TrackerHubResult<void> = await client.updateLineCount({
                frame: frame.frameNumber,
                newLineCount
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, frame]
    );

    const handleSetLinesPerBeat = useCallback(
        async (newLinesPerBeat: number) => {
            const result: TrackerHubResult<void> = await client.updateLinesPerBeat({
                frame: frame.frameNumber,
                newLinesPerBeat
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, frame]
    );

    const [octave, setOctave] = useAtom(octaveAtom);

    return(
        <div className="flex flex-row w-full justify-center items-center space-x-12 p-4 border-b">
            <Counter
                label="Lines"
                value={frame.length}
                min={WIP_CONSTANTS.MIN_LINES}
                max={WIP_CONSTANTS.MAX_LINES}
                onChange={handleSetLineCount}
            />
            <Counter
                label="LPB"
                value={frame.linesPerBeat}
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