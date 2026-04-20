import { toTwoDigitHex } from "@/utils/hex";
import { LineSpacer } from "./line-spacer";

export const ChannelLineNumbersHeader = () => {
    return(
        <div className="min-h-[190px] min-w-[38px] border-b border-r" />
    );
}

export interface ChannelLineNumbersProps {
    lineCount: number;
    linesPerBeat: number;
}

export const ChannelLineNumbers = ({ lineCount, linesPerBeat }: ChannelLineNumbersProps) => {
    return (
        <div className="min-w-[38px] flex flex-col">
            <div className="flex flex-col flex-grow border-r">
                <LineSpacer />
                {Array.from({ length: lineCount}, (_, i) => (
                    <LineNumber
                        key={i}
                        label={i}
                        isDownbeat={i % linesPerBeat === 0}
                    />
                ))}
                <LineSpacer />
            </div>
        </div>
    );

}

interface LineNumberProps {
    label: number;
    isDownbeat: boolean;
}

const LineNumber = ({ label, isDownbeat }: LineNumberProps) => {
    return(
        <div 
            className={
                `h-[32px] flex justify-center items-center py-1
                ${isDownbeat ? "bg-secondary text-foreground" : "bg-background-darker text-muted-foreground"}
                `
            }
        >
            {toTwoDigitHex(label)}
        </div>
    )
}