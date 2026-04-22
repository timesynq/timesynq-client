import { Cell } from "./cell";
import { SelectionFactory, SelectionType, useSelection } from "@/contexts/selection-provider";

export interface LineProps {
    frame: number;
    channel: number;
    line: number;
    isNoted: boolean;
    linesPerBeat: number;
    noteGroupsOpen: number;
    fxGroupsOpen: number;
}

export const Line = ({ frame, channel, line, isNoted, linesPerBeat, noteGroupsOpen, fxGroupsOpen }: LineProps) => {
    
    const isDownbeat: boolean = line % linesPerBeat === 0;
    const isLineSelected: boolean = useSelection((state) => state.selection?.line === line);
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
                        frame={frame}
                        channel={channel}
                        line={line}
                        group={0}
                        visible={isNoted}
                    />
                    <Instrument 
                        frame={frame}
                        channel={channel}
                        line={line}
                        group={0}
                        visible={isNoted}
                    />
                </>
            }
            {
                <>
                    <FXSymbol 
                        frame={frame}
                        channel={channel}
                        line={line}
                        group={0}
                    />
                    <FXValue
                        frame={frame}
                        channel={channel}
                        line={line}
                        group={0}
                    />
                </>
            }
        </div>
    );
}

interface PitchProps {
    frame: number;
    channel: number;
    line: number;
    group: number;
    visible?: boolean;
}

const Pitch = ({ frame, channel, line, group, visible = true }: PitchProps) => {

    const select = useSelection((state) => state.select);
    const isCellSelected = useSelection((state) =>
        state.selection?.type === SelectionType.Pitch && 
        state.selection?.frame === frame &&
        state.selection?.channel === channel &&
        state.selection?.line === line && 
        state.selection?.group === group
    )
    const isSelectedAndFocused = useSelection((state) => state.isFocused && isCellSelected);

    return ( 
        
        <div 
            className={`flex flex-row text-pitch ${!visible && "invisible"}`}
            onClick={() => select(SelectionFactory.selectPitch(frame, channel, line, group))}
        >
            <Cell 
                character="C"
                isSelectedAndFocused={isSelectedAndFocused}
                isSelected={isCellSelected}
            />
            <Cell 
                character="#"
                isSelectedAndFocused={isSelectedAndFocused}
                isSelected={isCellSelected}
            />
            <Cell 
                character="4"
                isSelectedAndFocused={isSelectedAndFocused}
                isSelected={isCellSelected}
            />
        </div>   
    ); 
}

interface InstrumentProps extends PitchProps {}

const Instrument = ({ frame, channel, line, group, visible = true }: InstrumentProps) => {

    const select = useSelection((state) => state.select);
    const isCell0Selected = useSelection((state) =>
        state.selection?.type === SelectionType.Instrument && 
        state.selection?.frame === frame &&
        state.selection?.channel === channel &&
        state.selection?.line === line && 
        state.selection?.group === group &&
        state.selection?.charPos === 0 
    )
    const isCell1Selected = useSelection((state) =>
        state.selection?.type === SelectionType.Instrument && 
        state.selection?.frame === frame &&
        state.selection?.channel === channel &&
        state.selection?.line === line && 
        state.selection?.group === group &&
        state.selection?.charPos === 1
    )
    const isCell0SelectedAndFocused = useSelection((state) => state.isFocused && isCell0Selected);
    const isCell1SelectedAndFocused = useSelection((state) => state.isFocused && isCell1Selected);

    return (    
        <div className={`flex flex-row text-instrument ${!visible && "invisible"}`}>
            <Cell
                character="0"
                isSelectedAndFocused={isCell0SelectedAndFocused}
                isSelected={isCell0Selected}
                onClick={() => select(SelectionFactory.selectInstrumentDigit(frame, channel, line, group, 0))}
            />
            <Cell
                character="E"
                isSelectedAndFocused={isCell1SelectedAndFocused}
                isSelected={isCell1Selected}
                onClick={() => select(SelectionFactory.selectInstrumentDigit(frame, channel, line, group, 1))}
            />
        </div>
    ); 
}

interface FXSymbolProps extends PitchProps {}

const FXSymbol = ({ frame, channel, line, group }: FXSymbolProps) => {

    const select = useSelection((state) => state.select);
    const isCell0Selected = useSelection((state) =>
        state.selection?.type === SelectionType.FXSymbol && 
        state.selection?.frame === frame &&
        state.selection?.channel === channel &&
        state.selection?.line === line && 
        state.selection?.group === group &&
        state.selection?.charPos === 0 
    )
    const isCell1Selected = useSelection((state) =>
        state.selection?.type === SelectionType.FXSymbol && 
        state.selection?.frame === frame &&
        state.selection?.channel === channel &&
        state.selection?.line === line && 
        state.selection?.group === group &&
        state.selection?.charPos === 1
    )
    const isCell0SelectedAndFocused = useSelection((state) => state.isFocused && isCell0Selected);
    const isCell1SelectedAndFocused = useSelection((state) => state.isFocused && isCell1Selected);

    return (    
        <div className="flex flex-row text-fx-symbol">
            <Cell
                character="A"
                isSelectedAndFocused={isCell0SelectedAndFocused}
                isSelected={isCell0Selected}
                onClick={() => select(SelectionFactory.selectFXSymbolDigit(frame, channel, line, group, 0))}
            />
            <Cell
                character="A"
                isSelectedAndFocused={isCell1SelectedAndFocused}
                isSelected={isCell1Selected}
                onClick={() => select(SelectionFactory.selectFXSymbolDigit(frame, channel, line, group, 1))}
            />
        </div>
    ); 
}

interface FXValueProps extends PitchProps {}

const FXValue = ({ frame, channel, line, group }: FXValueProps) => {

    const select = useSelection((state) => state.select);
    const isCell0Selected = useSelection((state) =>
        state.selection?.type === SelectionType.FXValue && 
        state.selection?.frame === frame &&
        state.selection?.channel === channel &&
        state.selection?.line === line && 
        state.selection?.group === group &&
        state.selection?.charPos === 0 
    )
    const isCell1Selected = useSelection((state) =>
        state.selection?.type === SelectionType.FXValue && 
        state.selection?.frame === frame &&
        state.selection?.channel === channel &&
        state.selection?.line === line && 
        state.selection?.group === group &&
        state.selection?.charPos === 1
    )
    const isCell0SelectedAndFocused = useSelection((state) => state.isFocused && isCell0Selected);
    const isCell1SelectedAndFocused = useSelection((state) => state.isFocused && isCell1Selected);


    return (    
        <div className="flex flex-row text-fx-value">
            <Cell
                character="1"
                isSelectedAndFocused={isCell0SelectedAndFocused}
                isSelected={isCell0Selected}
                onClick={() => select(SelectionFactory.selectFXValueDigit(frame, channel, line, group, 0))}
            />
            <Cell
                character="6"
                isSelectedAndFocused={isCell1SelectedAndFocused}
                isSelected={isCell1Selected}
                onClick={() => select(SelectionFactory.selectFXValueDigit(frame, channel, line, group, 1))}
            />
        </div>
    ); 
}