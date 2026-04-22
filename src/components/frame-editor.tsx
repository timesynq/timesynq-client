import { useCallback, useEffect, useState } from "react";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { Toasts } from "@/utils/toasts";
import { Counter } from "./counter";
import { WIP_CONSTANTS } from "@/api/wips/wip";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { UpdateLineCountCommand, UpdateLinesPerBeatCommand } from "@/api/tracker/tracker-hub-commands";
import { ChannelHeader, ChannelLines } from "./channel";
import { ChannelLineNumbers, ChannelLineNumbersHeader } from "./channel-line-numbers";
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelection } from "@/contexts/selection-provider";

export interface FrameEditorProps {
    client: TrackerHubClient;
    frame: number;
}

export const FrameEditor = ({ client, frame }: FrameEditorProps) => {
    
    const [lineCount, setLineCount] = useState<number>(64 /*temporary, this will be read from the server*/);
    const handleSetLineCount = useCallback(
        async (newLineCount: number) => {
            const result: TrackerHubResult<void> = await client.updateLineCount({
                frame: frame,
                newLineCount
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, frame]
    );

    const [linesPerBeat, setLinesPerBeat] = useState<number>(4 /*temporary, this will be read from the server*/);
    const handleSetLinesPerBeat = useCallback(
        async (newLinesPerBeat: number) => {
            const result: TrackerHubResult<void> = await client.updateLinesPerBeat({
                frame: frame,
                newLinesPerBeat
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, frame]
    );

    const [octave, setOctave] = useState<number>(4);

    useEffect(() => {
        
        const lineCountUpdatedCallback = (command: UpdateLineCountCommand) => {
            if (command.frame === frame)
                setLineCount(command.newLineCount);
            // todo:
                // this should still store the line count for that frame, so that if user switches to that
                // frame they will see the updated line count. switching frames will not fetch anything from server
        }
        const unsubscribeLineCountUpdated = client.subscribeLineCountUpdated(lineCountUpdatedCallback);

        const linesPerBeatUpdatedCallback = (command: UpdateLinesPerBeatCommand) => {
            if (command.frame === frame)
                setLinesPerBeat(command.newLinesPerBeat);
            // todo:
                // same as above
        }
        const unsubscribeLinesPerBeatUpdated = client.subscribeLinesPerBeatUpdated(linesPerBeatUpdatedCallback);

        return () => {
            unsubscribeLineCountUpdated();
            unsubscribeLinesPerBeatUpdated();
        }
    }, []);
    
    const setIsFocused = useSelection((state) => state.setIsFocused);

    return (
        <OutsideClickHandler 
            display="contents"
            onOutsideClick={() => setIsFocused(false)}
        >
            <div className="flex flex-col w-full h-full min-h-0 bg-background-darker" onClick={() => setIsFocused(true)}>
                <div className="flex flex-row w-full justify-center items-center space-x-12 p-4 border-b">
                    <Counter
                        label="Lines"
                        value={lineCount}
                        min={WIP_CONSTANTS.MIN_LINES}
                        max={WIP_CONSTANTS.MAX_LINES}
                        onChange={handleSetLineCount}
                    />
                    <Counter
                        label="LPB"
                        value={linesPerBeat}
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
                            frame={frame}
                            channel={0}
                            isNoted={false}
                        />
                        <ChannelHeader
                            frame={frame}
                            channel={1}
                            isNoted
                        />
                        <ChannelHeader
                            frame={frame}
                            channel={2}
                            isNoted={false}
                        />
                        <ChannelLineNumbersHeader />
                    </div>
                    <div className="flex flex-row w-full overflow-y-auto overflow-x-hidden">
                        <ChannelLineNumbers 
                            lineCount={lineCount}
                            linesPerBeat={linesPerBeat}
                        />
                        <ChannelLines
                            frame={frame}
                            channel={0}
                            isNoted={false}
                            lineCount={lineCount}
                            linesPerBeat={linesPerBeat}
                            noteGroupsOpen={1}
                            fxGroupsOpen={1}
                        />
                        <ChannelLines
                            frame={frame}
                            channel={1}
                            isNoted
                            lineCount={lineCount}
                            linesPerBeat={linesPerBeat}
                            noteGroupsOpen={1}
                            fxGroupsOpen={1}
                        />
                        <ChannelLines
                            frame={frame}
                            channel={2}
                            isNoted={false}
                            lineCount={lineCount}
                            linesPerBeat={linesPerBeat}
                            noteGroupsOpen={1}
                            fxGroupsOpen={1}
                        />
                        <ChannelLineNumbers 
                            lineCount={lineCount}
                            linesPerBeat={linesPerBeat}
                            isRightHandSide
                        />
                    </div>
                </div>
            </div>
        </OutsideClickHandler>
    );
}