import { useEffect, useState } from "react";
import type { User } from "../types/usertypes";
import { Link } from "react-router-dom";
import { loggedIn, signOut } from "../api/userapi";

export default function Home() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const getUserLogin = async () => {
            let loggedUser = await loggedIn();
            if (loggedUser) {
                console.log(loggedUser);
                setUser(loggedUser);
            }
        };

        getUserLogin();
    }, []);

    const userSignOut = async () => {
        await signOut();
        window.location.reload();
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <section className="text-center">
                <h1 className="text-3xl font-bold">
                    Home
                </h1>

                {user ? (
                    <div>
                        <p className="mt-4">Welcome back, {user.userName}!</p>
                        <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded" onClick={userSignOut}>Sign Out</button>
                    </div>

                ) : (
                    <div>
                        <p className="mt-4">You are not logged in.</p>
                        <Link to="/login">
                            <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded">
                                Login
                            </button>
                        </Link>

                    </div>
                )}
            </section>

            <footer className="absolute bottom-4 text-sm text-gray-500">
                copyright timesynq
            </footer>
        </main>
    );
}