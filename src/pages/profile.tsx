import { NavBar } from "@/components/nav-bar";

export default function Profile() {
    return (
        <>
            <NavBar></NavBar>
            <section className="text-left">
                <h1 className="text-3xl font-bold underline">
                    create
                </h1>
            </section>
            <footer className="absolute bottom-4 text-sm text-gray-500">
                copyright timesynq
            </footer>
        </>
    );
}