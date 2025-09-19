import { NavBar } from "@/components/nav-bar";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export const Sandbox = () => {
    const { fetchUser } = useAuthStore();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const sandboxRoutes = [
        { path: "/sandbox/tracker", label: "Tracker Sandbox" },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-1 flex flex-col items-center justify-center m-4">
                <h1 className="text-2xl font-bold mb-6">Sandbox Landing Page</h1>

                <ul className="space-y-4 w-full max-w-md">
                    {sandboxRoutes.map((route) => (
                        <li key={route.path}>
                            <Link
                                to={route.path}
                                className="block bg-gray-800 text-white px-4 py-3 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                            >
                                {route.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
};
