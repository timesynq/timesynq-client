import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { NavBar } from "@/components/nav-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { ProfilePicture } from "@/components/profile-picture";
import { UserSearchResults, UserService } from "@/api/users/user";

export const UserSearch = () => {
    const { user, isLoading, fetchUser } = useAuthStore();
    const [userQuery, setUserQuery] = useState("");
    const [results, setResults] = useState<UserSearchResults | null>();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (!user && !isLoading) {
        return <Navigate to="/" state={{ open: "signin" }} replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (userQuery.trim().length < 3) {
            setError("Please enter at least 3 letters.");
            return;
        }

        const users = await UserService.search(userQuery);
        console.log(users);
        setResults(users);
    };

    return (
        <>
            <NavBar />
            <main className="flex flex-col items-center justify-center">
                {isLoading ? (
                    <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                ) : (
                    <form onSubmit={handleSubmit} className="flex m-2">
                        <Input
                            className="w-75"
                            placeholder="Search..."
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                        />
                        <Button
                            type="submit"
                            className="bg-transparent hover:bg-blue-900/30 text-white font-bold py-2 px-4 ml-2 rounded border-none"
                        >
                            <SearchIcon className="text-foreground" />
                        </Button>
                    </form>
                )}

                {error && <p className="text-red-500 mt-2">{error}</p>}

                <ul className="mt-4 space-y-2">
                    {results && results.items.length > 0 ? (
                        results.items.map((i) => (
                            <li key={i.user.id} className="w-full">
                                <Link
                                    to={`/profile/${i.user.id}`}
                                    className="block bg-gray-800 p-4 shadow-md hover:shadow-lg hover:bg-gray-700 transition-all duration-200 w-150 border-2"
                                >
                                    <div className="flex items-center gap-4">
                                        <ProfilePicture data={i.user.profilePicture} size={12} />

                                        <div className="flex flex-col">
                                            <span className="text-lg font-semibold text-white">
                                                {i.user.userName}
                                            </span>

                                            <div className="flex gap-6 text-sm text-gray-300 mt-1">
                                                <span>
                                                    <span className="font-medium text-white">
                                                        {i.user.followerCount}
                                                    </span>{" "}
                                                    Followers
                                                </span>
                                                <span>
                                                    <span className="font-medium text-white">
                                                        {i.user.followeeCount}
                                                    </span>{" "}
                                                    Following
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    ) : (
                        !error && <p className="text-gray-400">No users found.</p>
                    )}
                </ul>
            </main>
        </>
    );
};

