export interface CellProps {
    character: string
}

export const Cell = ({ character }: CellProps) => {    
    return (
        <div className={`cell flex w-4 h-4 flex-col items-center justify-center w-full text-[8pt]`}>
            {character}
        </div>
    );
}