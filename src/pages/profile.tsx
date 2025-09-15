import { UserApi } from "@/api/users/user";
import { NavBar } from "@/components/nav-bar";
import { ProfilePicture } from "@/components/profile-picture";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { User } from "@/types/usertypes";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Profile() {
    
    const { user, fetchUser } = useAuthStore(); 
    const { displayedUserId } = useParams();
    const [displayedUser, setDisplayedUser] = useState<User | null>(null);
    const isMobile: boolean = useIsMobile();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        const fetchDisplayedUser = async () => {
            if(!user || !displayedUserId) return; //todo: redirect to home
            const isViewingOwnProfile: boolean = user.id === displayedUserId;
            if(isViewingOwnProfile){
                setDisplayedUser(user);
            }
            else{
                const otherUser = await UserApi.User(displayedUserId);
                setDisplayedUser(otherUser);
            }
        };
        fetchDisplayedUser();
    },[user, displayedUserId]);

    if(!user){
        //todo: redirect
        return;
    }

    const isViewingOwnProfile: boolean = user.id === displayedUserId;

    return (
        <>
            <NavBar></NavBar>
            <main className="flex flex-col items-center justify-center">
                
                {!displayedUser && 
                    <h1>User not found.</h1>
                }

                {displayedUser && 
                    <div className={`w-[50%] flex ${isMobile ? 'flex-col w-[90%]' : 'flex-row'} gap-4`}>
                        <Card className={`${isMobile ? 'w-full h-[50%]' : 'w-[350px]'} bg-muted rounded-lg shrink-0`}>
                            <CardHeader className="flex flex-col items-center justify-center">
                                <ProfilePicture data={displayedUser.profilePicture} size={15} />
                                <p className="text-2xl mt-2">{displayedUser.userName}</p>
                            </CardHeader>
                            <Separator />
                            <CardContent className="flex flex-row items-center justify-around py-2">
                                <div className="flex flex-col items-center space-y-1">
                                <p className="text-foreground text-lg font-medium">{displayedUser.followerCount}</p>
                                <p className="text-muted-foreground text-sm">Followers</p>
                                </div>
                                <div className="flex flex-col items-center space-y-1">
                                <p className="text-foreground text-lg font-medium">{displayedUser.followeeCount}</p>
                                <p className="text-muted-foreground text-sm">Following</p>
                                </div>
                            </CardContent>
                            <Separator />
                            <CardFooter className="flex flex-col items-center justify-center pt-6">
                                <p className="text-muted-foreground text-sm">
                                Joined {user.createdOnUTC.toLocaleDateString()}
                                </p>
                            </CardFooter>
                        </Card>
                        <div className={`${isMobile ? 'w-full' : 'flex-1'} bg-muted p-4 rounded-lg`}>
                            <p>Right section</p>
                        </div>
                    </div>
                }

            </main>
        </>
    );
}