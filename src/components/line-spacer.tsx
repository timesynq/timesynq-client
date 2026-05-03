export interface LineSpacerProps {
    isBottom?: boolean;
}

export const LineSpacer = ({ isBottom = false }: LineSpacerProps ) => {
    return (
        <div className={`min-h-[320px] ${isBottom && "h-full"} border-r`} />
    );
}