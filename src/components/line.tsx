import { useMemo } from "react";
import { Cell } from "./cell";
import { SelectionFactory, SelectionType, useSelection } from "@/contexts/selection-provider";
import { useAtomValue } from "jotai";
import { lineAtomFamily } from "@/atoms/tracker-atoms";
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
    const isLineSelected: boolean = useSelection((state) => state.selection?.lineNumber === lineNumber);
    const isFocusedAndSelected: boolean = useSelection((state) => state.isFocused && isLineSelected);

    let bgColor = "bg-background-darker";
    let border = "border-r";
    if (isFocusedAndSelected){
        bgColor = "bg-negative-background";
        border = "border-r-negative-foreground/30";
    }
    else if (isLineSelected){
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

    const select = useSelection((state) => state.select);
    const isCellSelected = useSelection((state) =>
        state.selection?.type === SelectionType.Pitch && 
        state.selection?.frameNumber === frameNumber &&
        state.selection?.channelNumber === channelNumber &&
        state.selection?.lineNumber === lineNumber && 
        state.selection?.group === group
    )
    const isSelectedAndFocused = useSelection((state) => state.isFocused && isCellSelected);

    const pitchString: string = pitch !== null ?  PitchUtility.pitchStringFromNumber(pitch) : "---";

    return ( 
        
        <div 
            className={`flex flex-row text-pitch ${!visible && "invisible"} ${isDisabled && "opacity-25"}`}
            onClick={() => select(SelectionFactory.selectPitch(frameNumber, channelNumber, lineNumber, group))}
        >
            <Cell 
                character={pitchString[0]}
                isSelectedAndFocused={isSelectedAndFocused}
                isSelected={isCellSelected}
            />
            <Cell 
                character={pitchString[1]}
                isSelectedAndFocused={isSelectedAndFocused}
                isSelected={isCellSelected}
            />
            <Cell 
                character={pitchString[2]}
                isSelectedAndFocused={isSelectedAndFocused}
                isSelected={isCellSelected}
            />
        </div>   
    ); 
}

interface InstrumentProps extends CellProps {
    instrument: number | null;
}

const Instrument = ({ frameNumber, channelNumber, lineNumber, group, visible = true, instrument, isDisabled }: InstrumentProps) => {

    const select = useSelection((state) => state.select);
    const isCell0Selected = useSelection((state) =>
        state.selection?.type === SelectionType.Instrument && 
        state.selection?.frameNumber === frameNumber &&
        state.selection?.channelNumber === channelNumber &&
        state.selection?.lineNumber === lineNumber && 
        state.selection?.group === group &&
        state.selection?.charPos === 0 
    )
    const isCell1Selected = useSelection((state) =>
        state.selection?.type === SelectionType.Instrument && 
        state.selection?.frameNumber === frameNumber &&
        state.selection?.channelNumber === channelNumber &&
        state.selection?.lineNumber === lineNumber && 
        state.selection?.group === group &&
        state.selection?.charPos === 1
    )
    const isCell0SelectedAndFocused = useSelection((state) => state.isFocused && isCell0Selected);
    const isCell1SelectedAndFocused = useSelection((state) => state.isFocused && isCell1Selected);

    const instrumentHexString: string = instrument !== null ? toTwoDigitHex(instrument) : "--";

    return (    
        <div className={`flex flex-row text-instrument ${!visible && "invisible"} ${isDisabled && "opacity-25"}`}>
            <Cell
                character={instrumentHexString[0]}
                isSelectedAndFocused={isCell0SelectedAndFocused}
                isSelected={isCell0Selected}
                onClick={() => select(SelectionFactory.selectInstrumentDigit(frameNumber, channelNumber, lineNumber, group, 0))}
            />
            <Cell
                character={instrumentHexString[1]}
                isSelectedAndFocused={isCell1SelectedAndFocused}
                isSelected={isCell1Selected}
                onClick={() => select(SelectionFactory.selectInstrumentDigit(frameNumber, channelNumber, lineNumber, group, 1))}
            />
        </div>
    ); 
}

interface FXSymbolProps extends CellProps {
    fxSymbol: number | null;
}

const FXSymbol = ({ frameNumber, channelNumber, lineNumber, group, fxSymbol, isDisabled }: FXSymbolProps) => {

    const select = useSelection((state) => state.select);
    const isCell0Selected = useSelection((state) =>
        state.selection?.type === SelectionType.FXSymbol && 
        state.selection?.frameNumber === frameNumber &&
        state.selection?.channelNumber === channelNumber &&
        state.selection?.lineNumber === lineNumber && 
        state.selection?.group === group &&
        state.selection?.charPos === 0 
    )
    const isCell1Selected = useSelection((state) =>
        state.selection?.type === SelectionType.FXSymbol && 
        state.selection?.frameNumber === frameNumber &&
        state.selection?.channelNumber === channelNumber &&
        state.selection?.lineNumber === lineNumber && 
        state.selection?.group === group &&
        state.selection?.charPos === 1
    )
    const isCell0SelectedAndFocused = useSelection((state) => state.isFocused && isCell0Selected);
    const isCell1SelectedAndFocused = useSelection((state) => state.isFocused && isCell1Selected);

    const fxSymbolHexString: string = fxSymbol !== null ? toTwoDigitHex(fxSymbol) : "--";

    return (    
        <div className={`flex flex-row text-fx-symbol ${isDisabled && "opacity-25"}`}>
            <Cell
                character={fxSymbolHexString[0]}
                isSelectedAndFocused={isCell0SelectedAndFocused}
                isSelected={isCell0Selected}
                onClick={() => select(SelectionFactory.selectFXSymbolDigit(frameNumber, channelNumber, lineNumber, group, 0))}
            />
            <Cell
                character={fxSymbolHexString[1]}
                isSelectedAndFocused={isCell1SelectedAndFocused}
                isSelected={isCell1Selected}
                onClick={() => select(SelectionFactory.selectFXSymbolDigit(frameNumber, channelNumber, lineNumber, group, 1))}
            />
        </div>
    ); 
}

interface FXValueProps extends CellProps {
    fxValue: number | null;
}

const FXValue = ({ frameNumber, channelNumber, lineNumber, group, fxValue, isDisabled }: FXValueProps) => {

    const select = useSelection((state) => state.select);
    const isCell0Selected = useSelection((state) =>
        state.selection?.type === SelectionType.FXValue && 
        state.selection?.frameNumber === frameNumber &&
        state.selection?.channelNumber === channelNumber &&
        state.selection?.lineNumber === lineNumber && 
        state.selection?.group === group &&
        state.selection?.charPos === 0 
    )
    const isCell1Selected = useSelection((state) =>
        state.selection?.type === SelectionType.FXValue && 
        state.selection?.frameNumber === frameNumber &&
        state.selection?.channelNumber === channelNumber &&
        state.selection?.lineNumber === lineNumber && 
        state.selection?.group === group &&
        state.selection?.charPos === 1
    )
    const isCell0SelectedAndFocused = useSelection((state) => state.isFocused && isCell0Selected);
    const isCell1SelectedAndFocused = useSelection((state) => state.isFocused && isCell1Selected);

    const fxValueHexString: string = fxValue !== null ? toTwoDigitHex(fxValue) : "--";

    return (    
        <div className={`flex flex-row text-fx-value ${isDisabled && "opacity-25"}`}>
            <Cell
                character={fxValueHexString[0]}
                isSelectedAndFocused={isCell0SelectedAndFocused}
                isSelected={isCell0Selected}
                onClick={() => select(SelectionFactory.selectFXValueDigit(frameNumber, channelNumber, lineNumber, group, 0))}
            />
            <Cell
                character={fxValueHexString[1]}
                isSelectedAndFocused={isCell1SelectedAndFocused}
                isSelected={isCell1Selected}
                onClick={() => select(SelectionFactory.selectFXValueDigit(frameNumber, channelNumber, lineNumber, group, 1))}
            />
        </div>
    ); 
}