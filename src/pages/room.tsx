import { NavBar } from "@/components/nav-bar";
import { useParams } from "react-router-dom";

export const Room = () => {

    const { roomCode } = useParams();

    return (
        <>
            <NavBar />
            <main className="flex flex-col items-center justify-center">
                <p>{roomCode}</p>
            </main>
        </>
    );
}