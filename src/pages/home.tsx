import { NavBar } from "@/components/nav-bar";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { User } from "@/types/usertypes";

export default function Home() {

    var user: User = {
        id: 'whatever',
        userName: "LONGESTUSERNAME7777777",
        profilePicture: 1064237082,
        createdOnUTC: 'janury 3',
    }

    return (
        <>
        <NavBar ></NavBar>
        <main className="flex flex-col items-center justify-center min-h-screen">
            <ProfileDropdown user={user} />
        </main>
        </>
    );
}