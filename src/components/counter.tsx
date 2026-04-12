import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";

export interface CounterProps {
    label: string;
    value: number;
    onChange: (newBpm: number) => void;
}

export const Counter = ({ label, value, onChange }: CounterProps) => {

    const [isInputDialogOpen, setIsInputDialogOpen] = useState<boolean>(false);

    const increment = (): void => {
        onChange(value + 1);
    };

    const decrement = (): void => {
        onChange(value - 1);
    };

    const handleOpenChange = (open: boolean) => {
        setIsInputDialogOpen(open);
    };

    const handleValueInput = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const input: string = formData.get(label) as string;
        const newValue = parseInt(input);

        onChange(newValue);
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
                    onClick={decrement}
                >
                    -
                </Button>

                <Dialog open={isInputDialogOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <span className="w-10 h-8 flex items-center justify-center bg-background-darker cursor-pointer">
                            {value}
                        </span>
                    </DialogTrigger>

                    <DialogContent className="w-64">
                        <DialogHeader>
                            <DialogTitle>Update {label}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleValueInput} className="flex flex-col space-y-4">
                            <Input
                                name={`${label}`}
                                type="number"
                                onChange={() => {}}
                                onSelect={(e) => e.stopPropagation()}
                                onClick={(e) => e.preventDefault()}
                                defaultValue={value}
                            />

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" className="cursor-pointer">
                                        Close
                                    </Button>
                                </DialogClose>
                                <Button type="submit" variant="positive" className="cursor-pointer">
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
                    onClick={increment}
                >
                    +
                </Button>
            </div>
        </div>
    );
};