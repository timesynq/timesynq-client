import { useCallback, useEffect, useState } from "react";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { Toasts } from "@/utils/toasts";
import { Counter } from "./counter";
import { WIP_CONSTANTS } from "@/api/wips/wip";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { UpdateLineCountCommand, UpdateLinesPerBeatCommand } from "@/api/tracker/tracker-hub-commands";

export interface FrameEditorProps {
    client: TrackerHubClient;
    currentFrame: number;
}

export const FrameEditor = ({ client, currentFrame }: FrameEditorProps) => {
    
    const [lineCount, setLineCount] = useState<number>(64 /*temporary, this will be read from the server*/);
    const handleSetLineCount = useCallback(
        async (newLineCount: number) => {
            const result: TrackerHubResult<void> = await client.updateLineCount({
                frame: currentFrame,
                newLineCount
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, currentFrame]
    );

    const [linesPerBeat, setLinesPerBeat] = useState<number>(4 /*temporary, this will be read from the server*/);
    const handleSetLinesPerBeat = useCallback(
        async (newLinesPerBeat: number) => {
            const result: TrackerHubResult<void> = await client.updateLinesPerBeat({
                frame: currentFrame,
                newLinesPerBeat
            });

            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
            }
        },
        [client, currentFrame]
    );

    useEffect(() => {
        
        const lineCountUpdatedCallback = (command: UpdateLineCountCommand) => {
            if (command.frame === currentFrame)
                setLineCount(command.newLineCount);
            // todo:
                // this should still store the line count for that frame, so that if user switches to that
                // frame they will see the updated line count. switching frames will not fetch anything from server
        }
        const unsubscribeLineCountUpdated = client.subscribeLineCountUpdated(lineCountUpdatedCallback);

        const linesPerBeatUpdatedCallback = (command: UpdateLinesPerBeatCommand) => {
            if (command.frame === currentFrame)
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
    
    return (
        <div className="flex flex-col w-full h-full min-h-0 p-4">
            <div className="flex flex-row w-full justify-center items-center space-x-12">
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
            </div>
        </div>
    );
}