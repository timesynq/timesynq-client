import { clamp } from "@/utils/math";
import { Button } from "./ui/button";

export enum NavigationCounterJustify {
    Center,
    Between
}

export interface NavigationCounterProps {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (newValue: number) => void;
    justify?: NavigationCounterJustify
}

export const NavigationCounter = (
    { 
        label,
        value,
        min,
        max,
        onChange,
        justify = NavigationCounterJustify.Center
    }: NavigationCounterProps
) => {
    
    let justifyString: string = "";
    switch(justify){
        case NavigationCounterJustify.Between:
            justifyString = "justify-between"
            break;
        case NavigationCounterJustify.Center:
        default:
            justifyString = "justify-center"
            break;
    }

    const increment = () => {
        onChange(clamp(value + 1, min, max));
    }

    const decrement = () => {
        onChange(clamp(value - 1, min, max));
    }

    return (
        <div className={`flex flex-row ${justifyString} items-center space-x-4`}>
            <span className="min-w-6">{label}</span>

            <div className="flex flex-row items-center">
                <Button
                    size="icon"
                    variant="secondary"
                    className={`w-8 h-8 text-lg rounded-none cursor-pointer ${value === min && "invisible"}`}
                    onClick={decrement}
                >
                    {"<"}
                </Button>

                <Button
                    size="icon"
                    variant="secondary"
                    className={`w-8 h-8 text-lg rounded-none cursor-pointer ${value === max && "invisible"}`}
                    onClick={increment}
                >
                    {">"}
                </Button>
            </div>
        </div>
    );

} 