import { NavBar } from "@/components/nav-bar";


const UserSearch = () => {
    return (
        <>
            <NavBar></NavBar>
            <div className="">
                <section className="flex">
                    <h1 className="text-3xl font-bold underline">
                        user search
                    </h1>
                </section>
                <footer className="absolute bottom-4 text-sm text-gray-500">
                    copyright timesynq
                </footer>
            </div>
        </>
    );
}

export default UserSearch