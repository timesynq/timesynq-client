import { SelectionFactory, SelectionType, useSelection } from "@/hooks/use-selection";
import { Cell } from "./cell";

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

    return (
        <div 
            className={
                `w-full flex flex-row items-center justify-center space-x-2 h-[32px] border-r
                ${isLineSelected ? "bg-negative-background border-r-negative-foreground/30" : 
                    isDownbeat ? "bg-secondary" : "bg-background-darker"}
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

    return ( 
        
        <div 
            className={`flex flex-row text-pitch ${!visible && "invisible"} ${isCellSelected && "bg-negative-foreground/30"}`}
            onClick={() => select(SelectionFactory.selectPitch(frame, channel, line, group))}
        >
            <Cell 
                character="C"
            />
            <Cell 
                character="#"
            />
            <Cell 
                character="4"
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

    return (    
        <div className={`flex flex-row text-instrument ${!visible && "invisible"}`}>
            <Cell
                character="0"
                isSelected={isCell0Selected}
                onClick={() => select(SelectionFactory.selectInstrumentDigit(frame, channel, line, group, 0))}
            />
            <Cell
                character="E"
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

    return (    
        <div className="flex flex-row text-fx-symbol">
            <Cell
                character="A"
                isSelected={isCell0Selected}
                onClick={() => select(SelectionFactory.selectFXSymbolDigit(frame, channel, line, group, 0))}
            />
            <Cell
                character="A"
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


    return (    
        <div className="flex flex-row text-fx-value">
            <Cell
                character="1"
                isSelected={isCell0Selected}
                onClick={() => select(SelectionFactory.selectFXValueDigit(frame, channel, line, group, 0))}
            />
            <Cell
                character="6"
                isSelected={isCell1Selected}
                onClick={() => select(SelectionFactory.selectFXValueDigit(frame, channel, line, group, 1))}
            />
        </div>
    ); 
}