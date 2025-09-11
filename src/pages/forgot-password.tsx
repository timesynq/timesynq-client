import { NavBar } from "@/components/nav-bar";


const ForgotPassword = () => {
    return (
        <>
            <NavBar></NavBar>
            <section className="text-right">
                <h1 className="text-3xl font-bold underline">
                    forgot password
                </h1>
            </section>
            <footer className="absolute bottom-4 text-sm text-gray-500">
                copyright timesynq
            </footer>
        </>
    );
}

export default ForgotPassword