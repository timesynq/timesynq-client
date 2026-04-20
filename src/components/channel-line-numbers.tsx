import { toTwoDigitHex } from "@/utils/hex";
import { LineSpacer } from "./line-spacer";

export interface ChannelLineNumberProps {
    lineCount: number;
    linesPerBeat: number;
    // scroll amount prop
}

export const ChannelLineNumbers = ({ lineCount, linesPerBeat }: ChannelLineNumberProps) => {
    return (
        <div className="border-r bg-background-darker">
            <div className="min-h-[190px] border-b" />
            <div className="flex flex-col w-[38px]">
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