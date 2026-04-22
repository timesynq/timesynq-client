export interface CellProps {
    character: string;
    isSelected?: boolean;
    onClick?: () => void;
}

export const Cell = ({ character, isSelected = false, onClick }: CellProps) => {    
    return (
        <div 
            className={`cell flex h-8 flex-col items-center justify-center text-[8pt] p-0.25 select-none cursor-pointer ${isSelected && "bg-negative-foreground/30"}`}
            onClick={onClick}        
        >
            {character}
        </div>
    );
}