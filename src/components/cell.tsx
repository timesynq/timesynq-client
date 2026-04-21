export interface CellProps {
    character: string;
    onClick?: () => void;
}

export const Cell = ({ character, onClick }: CellProps) => {    
    return (
        <div 
            className={`cell flex h-8 flex-col items-center justify-center text-[8pt] p-0.25 select-none cursor-pointer`}
            onClick={onClick}        
        >
            {character}
        </div>
    );
}