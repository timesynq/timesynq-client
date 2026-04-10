import { Table,  
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell } from "./ui/table"
import { Card } from "./ui/card"


export const FrameEditor = () => {
    const rows: number = 24;
    const cols: number = 12;

    return (
        <>
            <div className="max-w-[600px] max-h-[400px] overflow-auto">
                <Table className="overflow-x-scroll">
                    <TableHeader>
                        <TableRow>
                        {Array.from({ length: cols }).map((_, i) => (
                            <TableHead className="relative w-25 sticky"> Channel {i + 1} </TableHead>
                        ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: cols }).map((_, colIndex) => (
                            <TableCell key={colIndex}>
                                ---
                            </TableCell>
                            ))}
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}