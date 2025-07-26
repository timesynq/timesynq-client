import { useEffect, useState } from 'react';
import type { User } from '../types/usertypes';
import { ProfilePicture } from '../components/profile-picture';
import { loggedIn } from '../api/userapi';

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserLogin = async () => {
            try {
                const loggedUser = await loggedIn();
                if (loggedUser) {
                    console.log(loggedUser);
                    setUser(loggedUser);
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            } finally {
                setLoading(false);
            }
        };

        getUserLogin();
    }, []);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen px-4">
            <section>
                <h1 className="text-2xl font-bold mb-4">User Profile</h1>
                {loading ? (
                    <p className="text-black-500">Loading...</p>
                ) : user ? (
                    <div className="space-y-2 text-left">
                        <ProfilePicture user={user} />
                        <p>{user.userName}</p>
                    </div>
                ) : (
                    <p className="text-red-500">No user data found.</p>
                )}
            </section>
            <footer className="mt-8 text-sm text-gray-500">
                copyright timesynq
            </footer>
        </main>
    );
}