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

    return (
        <div className={`w-full flex flex-row items-center justify-center space-x-2 h-[32px] ${isDownbeat ? "bg-secondary" : "bg-background-darker"}`}>
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

    return ( 
        <div 
            className={`flex flex-row text-pitch ${!visible && "invisible"}`}
            onClick={() => console.log(`${frame}:${channel}:${line}:${group}:pitch`)}
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
    return (    
        <div className={`flex flex-row text-instrument ${!visible && "invisible"}`}>
            <Cell
                character="0"
                onClick={() => console.log(`${frame}:${channel}:${line}:${group}:char0:instrument`)}
            />
            <Cell
                character="E"
                onClick={() => console.log(`${frame}:${channel}:${line}:${group}:char1:instrument`)}
            />
        </div>
    ); 
}

interface FXSymbolProps extends PitchProps {}

const FXSymbol = ({ frame, channel, line, group }: FXSymbolProps) => {
    return (    
        <div className="flex flex-row text-fx-symbol">
            <Cell
                character="A"
                onClick={() => console.log(`${frame}:${channel}:${line}:${group}:char0:fxSymbol`)}
            />
            <Cell
                character="A"
                onClick={() => console.log(`${frame}:${channel}:${line}:${group}:char1:fxSymbol`)}
            />
        </div>
    ); 
}

interface FXValueProps extends PitchProps {}

const FXValue = ({ frame, channel, line, group }: FXValueProps) => {
    return (    
        <div className="flex flex-row text-fx-value">
            <Cell
                character="1"
                onClick={() => console.log(`${frame}:${channel}:${line}:${group}:char0:fxValue`)}
            />
            <Cell
                character="6"
                onClick={() => console.log(`${frame}:${channel}:${line}:${group}:char1:fxValue`)}
            />
        </div>
    ); 
}