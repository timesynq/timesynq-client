import { useCallback, useEffect } from "react";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { Toasts } from "@/utils/toasts";
import { Counter } from "./counter";
import { WIP_CONSTANTS } from "@/api/wips/wip";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { UpdateLineCountCommand, UpdateLinesPerBeatCommand } from "@/api/tracker/tracker-hub-commands";
import { ChannelHeader, ChannelLineNumbers, ChannelLineNumbersHeader, ChannelLines } from "./channel";
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelection } from "@/contexts/selection-provider";
import { currentFrameNumberAtom, frameAtomFamily, octaveAtom, setIndividualFrameAtom } from "@/atoms/tracker-atoms";
import { useAtom, useAtomValue } from "jotai";

export interface FrameEditorProps {
    client: TrackerHubClient;
}

export const FrameEditor = ({ client }: FrameEditorProps) => {
    
    const frameNumber = useAtomValue(currentFrameNumberAtom);
    const frame = useAtomValue(frameAtomFamily(frameNumber));
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

    // todo: don't rerender the whole frame editor when octave changes
    const [octave, setOctave] = useAtom(octaveAtom);

    const [, setIndividualFrame] = useAtom(setIndividualFrameAtom);

    useEffect(() => {
        const lineCountUpdatedCallback = (command: UpdateLineCountCommand) => {
            setIndividualFrame({ index: command.frame, updater: (frame) => ({...frame, length: command.newLineCount})});
        }
        const unsubscribeLineCountUpdated = client.subscribeLineCountUpdated(lineCountUpdatedCallback);

        const linesPerBeatUpdatedCallback = (command: UpdateLinesPerBeatCommand) => {
                setIndividualFrame({ index: command.frame, updater: (frame) => ({...frame, linesPerBeat: command.newLinesPerBeat})});
        }
        const unsubscribeLinesPerBeatUpdated = client.subscribeLinesPerBeatUpdated(linesPerBeatUpdatedCallback);

        return () => {
            unsubscribeLineCountUpdated();
            unsubscribeLinesPerBeatUpdated();
        }
    }, [frame]);
    
    const setIsFocused = useSelection((state) => state.setIsFocused);

    return (
        <div className="flex flex-col w-full h-full min-h-0 bg-background-darker">
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
            <div className="flex flex-col h-full min-h-0">
                <div className="flex flex-row w-full">
                    <ChannelLineNumbersHeader />
                    <ChannelHeader
                        frame={frame.frameNumber}
                        channel={0}
                        isNoted={false}
                    />
                    <ChannelHeader
                        frame={frame.frameNumber}
                        channel={1}
                        isNoted
                    />
                    <ChannelHeader
                        frame={frame.frameNumber}
                        channel={2}
                        isNoted={false}
                    />
                    <ChannelLineNumbersHeader />
                </div>
                <OutsideClickHandler 
                    display="contents"
                    onOutsideClick={() => setIsFocused(false)}
                >
                    <div className="flex flex-row w-full overflow-y-auto overflow-x-hidden" onClick={() => setIsFocused(true)}>
                        <ChannelLineNumbers
                            lineCount={frame.length}
                            linesPerBeat={frame.linesPerBeat}
                        />
                        <ChannelLines
                            frame={frame.frameNumber}
                            channel={0}
                            isNoted={false}
                            lineCount={frame.length}
                            linesPerBeat={frame.linesPerBeat}
                            noteGroupsOpen={1}
                            fxGroupsOpen={1}
                        />
                        <ChannelLines
                            frame={frame.frameNumber}
                            channel={1}
                            isNoted
                            lineCount={frame.length}
                            linesPerBeat={frame.linesPerBeat}
                            noteGroupsOpen={1}
                            fxGroupsOpen={1}
                        />
                        <ChannelLines
                            frame={frame.frameNumber}
                            channel={2}
                            isNoted={false}
                            lineCount={frame.length}
                            linesPerBeat={frame.linesPerBeat}
                            noteGroupsOpen={1}
                            fxGroupsOpen={1}
                        />
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