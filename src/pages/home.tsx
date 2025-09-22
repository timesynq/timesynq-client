import { useAuth } from "@/contexts/auth-provider";

export const Home = () => {

    const { user } = useAuth();

    return (
        <main className="flex-1 flex flex-col items-center justify-center m-4">
            {user?.userName}
        </main>
    );

}