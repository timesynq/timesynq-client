import { NavBar } from "@/components/nav-bar";


export const EmailConfirmed = () => {
    return (
        <main className="flex">
            <NavBar></NavBar>
            <section className="text-right">
                <h1 className="text-3xl font-bold underline">
                    email confirmed
                </h1>
            </section>
            <footer className="absolute bottom-4 text-sm text-gray-500">
                copyright timesynq
            </footer>
        </main>
    );
}