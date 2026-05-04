import { SelectionType } from "@/atoms/tracker-atoms";

export interface CellProps {
    character: string;
    selectionType: SelectionType;
    onClick?: () => void;
}

export const Cell = ({ character, selectionType, onClick }: CellProps) => {    
    let highlightColor = "";
    if (selectionType === SelectionType.SelectedAndFocused)
        highlightColor = "bg-negative-foreground/30";
    else if (selectionType === SelectionType.SelectedAndUnfocused)
        highlightColor = "bg-ring/60";

    return (
        <div 
            className={
                `cell flex h-8 flex-col items-center justify-center text-[8pt] p-0.25 select-none cursor-pointer
                ${highlightColor}    
                `
            }
            onClick={onClick}        
        >
            {character}
        </div>
    );
}