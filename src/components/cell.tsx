export interface CellProps {
    character: string;
    isSelectedAndFocused: boolean;
    isSelected: boolean;
    onClick?: () => void;
}

export const Cell = ({ character, isSelectedAndFocused, isSelected, onClick }: CellProps) => {    
    let highlightColor = "";
    if (isSelectedAndFocused)
        highlightColor = "bg-negative-foreground/30";
    else if (isSelected)
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