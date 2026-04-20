import { Cell } from "./cell";

export interface LineProps {
    label: number;
    isNoted: boolean;
    linesPerBeat: number;
    noteGroupsOpen: number;
    fxGroupsOpen: number;
}

export const Line = ({ label, isNoted, linesPerBeat, noteGroupsOpen, fxGroupsOpen }: LineProps) => {
    
    const isDownbeat: boolean = label % linesPerBeat === 0;

    return (
        <div className={`w-full flex flex-row items-center justify-center space-x-2 h-[32px] ${isDownbeat ? "bg-secondary" : "bg-background-darker"}`}>
            { isNoted &&
                <>
                    <Pitch />
                    <Instrument />
                </>
            }
            {
                <>
                    <FXSymbol />
                    <FXValue />
                </>
            }
        </div>
    );
}

const Pitch = () => {

    return ( 
        <div className="flex flex-row space-x-0.5">
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

const Instrument = () => {
    return (    
        <div className="flex flex-row">
            <Cell
                character="0"
            />
            <Cell
                character="E"
            />
        </div>
    ); 
}

const FXSymbol = () => {
    return (    
        <div className="flex flex-row">
            <Cell
                character="A"
            />
            <Cell
                character="A"
            />
        </div>
    ); 
}

const FXValue = () => {
    return (    
        <div className="flex flex-row">
            <Cell
                character="1"
            />
            <Cell
                character="6"
            />
        </div>
    ); 
}