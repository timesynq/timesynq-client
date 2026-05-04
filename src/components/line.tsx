import { useMemo } from "react";
import { Cell } from "./cell";
import { useAtom, useAtomValue } from "jotai";
import { cellSelectionAtom, CellSelectionType, lineAtomFamily, lineSelectionAtom, Selection, SelectionFactory, SelectionType, setSelectionAtom } from "@/atoms/tracker-atoms";
import { toTwoDigitHex } from "@/utils/hex";
import { PitchUtility } from "@/utils/pitch";

export interface LineProps {
    frameNumber: number;
    channelNumber: number;
    lineNumber: number;
    isNoted: boolean;
    linesPerBeat: number;
    noteGroupsOpen: number;
    fxGroupsOpen: number;
    isDisabled: boolean;
}

export const Line = ({ frameNumber, channelNumber, lineNumber, isNoted, linesPerBeat, noteGroupsOpen, fxGroupsOpen, isDisabled }: LineProps) => {
    
    const params = useMemo(
        () => ({ frameNumber, channelNumber, lineNumber }),
        [frameNumber, channelNumber, lineNumber]
    )
    const line = useAtomValue(lineAtomFamily(params));

    const isDownbeat: boolean = lineNumber % linesPerBeat === 0;
    const lineSelectionType: SelectionType = useAtomValue(lineSelectionAtom(lineNumber));
    
    let bgColor = "bg-background-darker";
    let border = "border-r";
    if (lineSelectionType === SelectionType.SelectedAndFocused){
        bgColor = "bg-negative-background";
        border = "border-r-negative-foreground/30";
    }
    else if (lineSelectionType === SelectionType.SelectedAndUnfocused){
        bgColor = "bg-input";
    }
    else if (isDownbeat){
        bgColor = "bg-secondary";
    }

    return (
        <div 
            className={
                `w-full flex flex-row items-center justify-center space-x-2 h-[32px] border-r
                ${bgColor} ${border}
                `
            }
        >
            {
                <>
                    <Pitch 
                        frameNumber={frameNumber}
                        channelNumber={channelNumber}
                        lineNumber={lineNumber}
                        group={0}
                        visible={isNoted}
                        pitch={line.pitches ? line.pitches[0] : null}
                        isDisabled={isDisabled}
                    />
                    <Instrument 
                        frameNumber={frameNumber}
                        channelNumber={channelNumber}
                        lineNumber={lineNumber}
                        group={0}
                        visible={isNoted}
                        instrument={line.instruments ? line.instruments[0] : null}
                        isDisabled={isDisabled}
                    />
                </>
            }
            {
                <>
                    <FXSymbol 
                        frameNumber={frameNumber}
                        channelNumber={channelNumber}
                        lineNumber={lineNumber}
                        group={0}
                        fxSymbol={line.fxSymbols ? line.fxSymbols[0] : null}
                        isDisabled={isDisabled}
                    />
                    <FXValue
                        frameNumber={frameNumber}
                        channelNumber={channelNumber}
                        lineNumber={lineNumber}
                        group={0}
                        fxValue={line.fxValues ? line.fxValues[0] : null}
                        isDisabled={isDisabled}
                    />
                </>
            }
        </div>
    );
}

interface CellProps {
    frameNumber: number;
    channelNumber: number;
    lineNumber: number;
    group: number;
    visible?: boolean;
    isDisabled: boolean;
}

interface PitchProps extends CellProps {
    pitch: number | null;
}

const Pitch = ({ frameNumber, channelNumber, lineNumber, group, visible = true, pitch, isDisabled }: PitchProps) => {

    const [, setSelection] = useAtom(setSelectionAtom);
    const params = useMemo<Selection>(
        () => (
            { 
                frameNumber, 
                channelNumber, 
                lineNumber, 
                group, 
                type: CellSelectionType.Pitch, 
                charPos: null 
            }
        ),
        [frameNumber, channelNumber, lineNumber, group]
    )
    const selectionType = useAtomValue(cellSelectionAtom(params));

    const pitchString: string = pitch !== null ?  PitchUtility.pitchStringFromNumber(pitch) : "---";

    return ( 
        
        <div 
            className={`flex flex-row text-pitch ${!visible && "invisible"} ${isDisabled && "opacity-25"}`}
            onClick={() => setSelection({ selection: SelectionFactory.selectPitch(frameNumber, channelNumber, lineNumber, group) })}
        >
            <Cell 
                character={pitchString[0]}
                selectionType={selectionType}
            />
            <Cell 
                character={pitchString[1]}
                selectionType={selectionType}
            />
            <Cell 
                character={pitchString[2]}
                selectionType={selectionType}
            />
        </div>   
    ); 
}

interface InstrumentProps extends CellProps {
    instrument: number | null;
}

const Instrument = ({ frameNumber, channelNumber, lineNumber, group, visible = true, instrument, isDisabled }: InstrumentProps) => {

    const [, setSelection] = useAtom(setSelectionAtom);
    const params0 = useMemo<Selection>(
        () => (
            { 
                frameNumber, 
                channelNumber, 
                lineNumber, 
                group, 
                type: CellSelectionType.Instrument, 
                charPos: 0 
            }
        ),
        [frameNumber, channelNumber, lineNumber, group]
    )
    const selectionType0 = useAtomValue(cellSelectionAtom(params0));
    const params1 = useMemo<Selection>(
        () => (
            { 
                frameNumber, 
                channelNumber, 
                lineNumber, 
                group, 
                type: CellSelectionType.Instrument, 
                charPos: 1 
            }
        ),
        [frameNumber, channelNumber, lineNumber, group]
    )
    const selectionType1 = useAtomValue(cellSelectionAtom(params1));

    const instrumentHexString: string = instrument !== null ? toTwoDigitHex(instrument) : "--";

    return (    
        <div className={`flex flex-row text-instrument ${!visible && "invisible"} ${isDisabled && "opacity-25"}`}>
            <Cell
                character={instrumentHexString[0]}
                selectionType={selectionType0}
                onClick={() => setSelection({ selection: SelectionFactory.selectInstrumentDigit(frameNumber, channelNumber, lineNumber, group, 0) })}
            />
            <Cell
                character={instrumentHexString[1]}
                selectionType={selectionType1}
                onClick={() => setSelection({ selection: SelectionFactory.selectInstrumentDigit(frameNumber, channelNumber, lineNumber, group, 1) })}
            />
        </div>
    ); 
}

interface FXSymbolProps extends CellProps {
    fxSymbol: number | null;
}

const FXSymbol = ({ frameNumber, channelNumber, lineNumber, group, fxSymbol, isDisabled }: FXSymbolProps) => {

    const [, setSelection] = useAtom(setSelectionAtom);
    const params0 = useMemo<Selection>(
        () => (
            { 
                frameNumber, 
                channelNumber, 
                lineNumber, 
                group, 
                type: CellSelectionType.FXSymbol, 
                charPos: 0 
            }
        ),
        [frameNumber, channelNumber, lineNumber, group]
    )
    const selectionType0 = useAtomValue(cellSelectionAtom(params0));
    const params1 = useMemo<Selection>(
        () => (
            { 
                frameNumber, 
                channelNumber, 
                lineNumber, 
                group, 
                type: CellSelectionType.FXSymbol, 
                charPos: 1 
            }
        ),
        [frameNumber, channelNumber, lineNumber, group]
    )
    const selectionType1 = useAtomValue(cellSelectionAtom(params1));

    const fxSymbolHexString: string = fxSymbol !== null ? toTwoDigitHex(fxSymbol) : "--";

    return (    
        <div className={`flex flex-row text-fx-symbol ${isDisabled && "opacity-25"}`}>
            <Cell
                character={fxSymbolHexString[0]}
                selectionType={selectionType0}
                onClick={() => setSelection({ selection: SelectionFactory.selectFXSymbolDigit(frameNumber, channelNumber, lineNumber, group, 0) })}
            />
            <Cell
                character={fxSymbolHexString[1]}
                selectionType={selectionType1}
                onClick={() => setSelection({ selection: SelectionFactory.selectFXSymbolDigit(frameNumber, channelNumber, lineNumber, group, 1) })}
            />
        </div>
    ); 
}

interface FXValueProps extends CellProps {
    fxValue: number | null;
}

const FXValue = ({ frameNumber, channelNumber, lineNumber, group, fxValue, isDisabled }: FXValueProps) => {

    const [, setSelection] = useAtom(setSelectionAtom);
    const params0 = useMemo<Selection>(
        () => (
            { 
                frameNumber, 
                channelNumber, 
                lineNumber, 
                group, 
                type: CellSelectionType.FXValue, 
                charPos: 0 
            }
        ),
        [frameNumber, channelNumber, lineNumber, group]
    )
    const selectionType0 = useAtomValue(cellSelectionAtom(params0));
    const params1 = useMemo<Selection>(
        () => (
            { 
                frameNumber, 
                channelNumber, 
                lineNumber, 
                group, 
                type: CellSelectionType.FXValue, 
                charPos: 1 
            }
        ),
        [frameNumber, channelNumber, lineNumber, group]
    )
    const selectionType1 = useAtomValue(cellSelectionAtom(params1));

    const fxValueHexString: string = fxValue !== null ? toTwoDigitHex(fxValue) : "--";

    return (    
        <div className={`flex flex-row text-fx-value ${isDisabled && "opacity-25"}`}>
            <Cell
                character={fxValueHexString[0]}
                selectionType={selectionType0}
                onClick={() => setSelection({ selection: SelectionFactory.selectFXValueDigit(frameNumber, channelNumber, lineNumber, group, 0) })}
            />
            <Cell
                character={fxValueHexString[1]}
                selectionType={selectionType1}
                onClick={() => setSelection({ selection: SelectionFactory.selectFXValueDigit(frameNumber, channelNumber, lineNumber, group, 1) })}
            />
        </div>
    ); 
}