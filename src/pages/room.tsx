import { NavBar } from "@/components/nav-bar";


const Room = () => {
    return (
        <main className="flex">
            <NavBar></NavBar>
            <section className="text-right">
                <h1 className="text-3xl font-bold underline">
                    room
                </h1>
            </section>
            <footer className="absolute bottom-4 text-sm text-gray-500">
                copyright timesynq
            </footer>
        </main>
    );
}

export default Room