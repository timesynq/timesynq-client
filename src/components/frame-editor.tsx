import { useCallback, useEffect, useRef } from "react";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { Toasts } from "@/utils/toasts";
import { Counter } from "./counter";
import { WIP_CONSTANTS } from "@/api/wips/wip";
import { FrameMetadata, TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { LineUpdateCommand, UpdateChannelMuteCommand, UpdateChannelSoloCommand, UpdateChannelTypeCommand, UpdateFXSymbolCommand, UpdateFXValueCommand, UpdateInstrumentCommand, UpdateLineCountCommand, UpdateLinesPerBeatCommand, UpdatePitchCommand } from "@/api/tracker/tracker-hub-commands";
import { ChannelHeader, ChannelLineNumbers, ChannelLineNumbersHeader, ChannelLines } from "./channel";
import { channelCountAtom, currentFrameNumberAtom, frameEditorKeypressAtom, frameMetadataAtomFamily, octaveAtom, setIndividualChannelMetadataAtom, setIndividualFrameMetadataAtom, setIndividualLineAtom, setIsFocusedAtom } from "@/atoms/tracker-atoms";
import { useAtom, useAtomValue } from "jotai";

export interface FrameEditorProps {
    client: TrackerHubClient;
}

export const FrameEditor = ({ client }: FrameEditorProps) => {
    
    const containerRef = useRef<HTMLDivElement | null>(null);
    const channelCount = useAtomValue(channelCountAtom);
    const frameNumber = useAtomValue(currentFrameNumberAtom);
    const frameMetadata = useAtomValue(frameMetadataAtomFamily(frameNumber));

    const [, setIsFocused] = useAtom(setIsFocusedAtom);
    const [, createCommand] = useAtom(frameEditorKeypressAtom);
    const [, setIndividualFrameMetadata] = useAtom(setIndividualFrameMetadataAtom);
    const [, setIndividualChannelMetadata] = useAtom(setIndividualChannelMetadataAtom);
    const [, setIndividualLine] = useAtom(setIndividualLineAtom);    

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

        const pitchUpdatedCallback = (command: UpdatePitchCommand) => {
            setIndividualLine({ 
                frameNumber: command.frame, 
                channelNumber: command.channel, 
                lineNumber: command.line,
                updater: (line) => {
                    const newPitches: (number | null)[] = line.pitches ?? new Array<number | null>(WIP_CONSTANTS.MAX_NOTE_GROUPS).fill(null);
                    newPitches[command.noteGroup] = command.newPitch;
                    return {
                        ...line,
                        pitches: newPitches,
                    }
                }
            })
        }
        const unsubscribePitchUpdated = client.subscribePitchUpdated(pitchUpdatedCallback);

        const instrumentUpdatedCallback = (command: UpdateInstrumentCommand) => {
            setIndividualLine({ 
                frameNumber: command.frame, 
                channelNumber: command.channel, 
                lineNumber: command.line,
                updater: (line) => {
                    const newInstruments: (number | null)[] = line.instruments ?? new Array<number | null>(WIP_CONSTANTS.MAX_NOTE_GROUPS).fill(null);
                    newInstruments[command.noteGroup] = command.newInstrument;
                    return {
                        ...line,
                        instruments: newInstruments,
                    }
                }
            })
        }
        const unsubscribeInstrumentUpdated = client.subscribeInstrumentUpdated(instrumentUpdatedCallback);

        const fxSymbolUpdatedCallback = (command: UpdateFXSymbolCommand) => {
            setIndividualLine({ 
                frameNumber: command.frame, 
                channelNumber: command.channel, 
                lineNumber: command.line,
                updater: (line) => {
                    const newFXSymbols: (number | null)[] = line.fxSymbols ?? new Array<number | null>(WIP_CONSTANTS.MAX_FX_GROUPS).fill(null);
                    newFXSymbols[command.fxGroup] = command.newFXSymbol;
                    return {
                        ...line,
                        fxSymbols: newFXSymbols,
                    }
                }
            })
        }
        const unsubscribeFXSymbolUpdated = client.subscribeFXSymbolUpdated(fxSymbolUpdatedCallback);

        const fxValueUpdatedCallback = (command: UpdateFXValueCommand) => {
            setIndividualLine({ 
                frameNumber: command.frame, 
                channelNumber: command.channel, 
                lineNumber: command.line,
                updater: (line) => {
                    const newFXValues: (number | null)[] = line.fxValues ?? new Array<number | null>(WIP_CONSTANTS.MAX_FX_GROUPS).fill(null);
                    newFXValues[command.fxGroup] = command.newFXValue;
                    return {
                        ...line,
                        fxValues: newFXValues,
                    }
                }
            })
        }
        const unsubscribeFXValueUpdated = client.subscribeFXValueUpdated(fxValueUpdatedCallback);

        return () => {
            unsubscribeLineCountUpdated();
            unsubscribeLinesPerBeatUpdated();
            unsubscribeChannelTypeUpdated();
            unsubscribeChannelMuteUpdated();
            unsubscribeChannelSoloUpdated();
            unsubscribePitchUpdated();
            unsubscribeInstrumentUpdated();
            unsubscribeFXSymbolUpdated();
            unsubscribeFXValueUpdated();
        }
    }, [client, frameMetadata]);
    
    useEffect(() => {
        const handleFocusIn = (event: FocusEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsFocused({ isFocused: false });
            }
        };

        const handleMouseDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsFocused({ isFocused: false });
            }
        };

        window.addEventListener("focusin", handleFocusIn);
        window.addEventListener("mousedown", handleMouseDown);

        return () => {
            window.removeEventListener("focusin", handleFocusIn);
            window.removeEventListener("mousedown", handleMouseDown);
        };
    }, [setIsFocused]);

    useEffect(() => {
        const handleKeypress = async (e: KeyboardEvent) => {
            const command: LineUpdateCommand | null = createCommand({ keyboardEvent: e });
            console.log(command);
            if (command === null)
                return;
            let result: TrackerHubResult<void>;
            switch (command.type) {
                case "pitch":
                    result = await client.updatePitch(command);
                    break;
                case "instrument":
                    result = await client.updateInstrument(command);
                    break;
                case "fxSymbol":
                    result = await client.updateFXSymbol(command);
                    break;
                case "fxValue":
                default:
                    result = await client.updateFXValue(command);
                    break;
            }
            if (!result.isSuccessful) {
                Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);    
            }
        }
        window.addEventListener("keypress", handleKeypress);
        return () => window.removeEventListener("keypress", handleKeypress);
    }, [createCommand]);

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
                        { Array.from({ length: channelCount + 1 }).map((_, index) => (
                            <ChannelHeader
                                client={client}
                                frameNumber={frameMetadata.frameNumber}
                                channelNumber={index}
                            />
                        ))}
                        <ChannelLineNumbersHeader />
                    </div>
                    <div 
                        ref={containerRef}
                        className="flex flex-row w-max min-w-full flex-1 overflow-y-auto" 
                        onClick={() => setIsFocused({ isFocused: true })}
                    >
                        <ChannelLineNumbers
                            lineCount={frameMetadata.length}
                            linesPerBeat={frameMetadata.linesPerBeat}
                        />
                        { Array.from({ length: channelCount + 1 }).map((_, index) => (
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