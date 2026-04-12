import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { clamp } from "@/utils/math";

export interface CounterProps {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (newValue: number) => void;
}

export const Counter = ({ label, value, min, max, onChange }: CounterProps) => {
    const DELAY_MS = 250;
    const INTERVAL_MS = 25;

    const [isInputDialogOpen, setIsInputDialogOpen] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const isHoldingRef = useRef(false);

    useEffect(() => {
        if (!isHoldingRef.current) {
            setLocalValue(value);
        }
    }, [value]);

    const increment = (): void => {
        setLocalValue(prev =>
            clamp(prev + 1, min, max)
        );
    }

    const decrement = (): void => {
        setLocalValue(prev => 
            clamp(prev - 1, min, max)
        );
    }

    const startHolding = (action: () => void) => {
        isHoldingRef.current = true;

        action();

        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                action();
            }, INTERVAL_MS);
        }, DELAY_MS);
    };

    const stopHolding = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (isHoldingRef.current) {
            isHoldingRef.current = false;
            onChange(localValue);
        }
    };

    const handleValueInput = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const input = formData.get(label) as string;
        const newValue = parseInt(input);

        if (isNaN(newValue)) return;

        const clamped = clamp(newValue, min, max);

        setLocalValue(clamped);
        onChange(clamped);
        setIsInputDialogOpen(false);
    };

    return (
        <div className="flex flex-row justify-center items-center space-x-4">
            <span>{label}</span>

            <div className="flex flex-row items-center">
                <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 text-lg rounded-none"
                    onMouseDown={() => startHolding(decrement)}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                    onTouchStart={() => startHolding(decrement)}
                    onTouchEnd={stopHolding}
                >
                    -
                </Button>

                <Dialog open={isInputDialogOpen} onOpenChange={setIsInputDialogOpen}>
                    <DialogTrigger asChild>
                        <span className="w-10 h-8 flex items-center justify-center bg-background-darker cursor-pointer">
                            {localValue}
                        </span>
                    </DialogTrigger>

                    <DialogContent className="w-64">
                        <DialogHeader>
                            <DialogTitle>Update {label}</DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleValueInput}
                            className="flex flex-col space-y-4"
                        >
                            <Input
                                name={label}
                                type="number"
                                defaultValue={localValue}
                            />

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Close
                                    </Button>
                                </DialogClose>

                                <Button type="submit" variant="positive">
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 text-lg rounded-none"
                    onMouseDown={() => startHolding(increment)}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                    onTouchStart={() => startHolding(increment)}
                    onTouchEnd={stopHolding}
                >
                    +
                </Button>
            </div>
        </div>
    );
};