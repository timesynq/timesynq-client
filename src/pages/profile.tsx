import { ProfilePicture } from "@/components/profile-picture";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CheckIcon from "@/assets/svg/check-icon.svg?react";
import XIcon from "@/assets/svg/x-icon.svg?react";
import { FollowService, FollowRequest, UnfollowRequest } from "@/api/follows/follow";
import { Toasts } from "@/utils/toasts";
import { User, UserService } from "@/api/users/user";
import { useAuth } from "@/contexts/auth-provider";
import { useIsLg } from "@/hooks/use-lg";

export const Profile = () => {
    
    const { user } = useAuth(); 
    const { displayedUserId } = useParams();
    const [displayedUser, setDisplayedUser] = useState<User | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [isHoveringFollowButton, setIsHoveringFollowButton] = useState<boolean>(false);
    const isLg: boolean = useIsLg();

    if(!user) return null;

    useEffect(() => {
        const fetchDisplayedUser = async () => {
            const profileId = displayedUserId ?? user.id; 
            const isViewingOwnProfile: boolean = user.id === profileId;
            if(isViewingOwnProfile){
                setDisplayedUser(user);
            }
            else{
                const profile = await UserService.profile(profileId);
                setDisplayedUser(profile ? profile.user : null);
                setIsFollowing(profile ? profile.isFollowing : false);
            }
        };
        fetchDisplayedUser();
    },[user, displayedUserId]);

    const isViewingOwnProfile: boolean = user.id === displayedUserId;

    const handleFollow = async (): Promise<void> => {
        if(!displayedUser)
            return;
        const request: FollowRequest = {
            followeeId: displayedUser.id
        }
        const followResult = await FollowService.follow(request, (description: string) => {Toasts.error(description)});
        if(followResult){
            setDisplayedUser({
                ...displayedUser,
                followerCount: displayedUser.followerCount + 1,
            });
            setIsFollowing(true);
            setIsHoveringFollowButton(false);
        }
    }

    const handleUnfollow = async (): Promise<void> => {
        if(!displayedUser)
            return;
        const request: UnfollowRequest = {
            followeeId: displayedUser.id,
        }
        const unfollowResult = await FollowService.unfollow(request, (description: string) => {Toasts.error(description)});
        if(unfollowResult){
            setDisplayedUser({
                ...displayedUser,
                followerCount: displayedUser.followerCount - 1,
            });
            setIsFollowing(false);
        }
    }

    return (
        <main className="flex flex-col items-center justify-center m-4">
            
            {!displayedUser && 
                <h1>User not found.</h1>
            }

            {displayedUser && 
                <div className={`flex ${!isLg ? 'flex-col w-[90%]' : 'flex-row min-w-[50%]'} gap-4`}>
                    <Card className={`${!isLg ? 'w-full h-[50%]' : 'w-[350px]'} bg-muted rounded-lg shrink-0`}>
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
                        <CardFooter className="flex flex-col items-center justify-center space-y-3 p-4">
                            {!isViewingOwnProfile && 
                                <Button 
                                    variant={
                                        isFollowing ? (isHoveringFollowButton ? "negative" : "positive") : "outline"
                                    } 
                                    className="flex flex-row items-center justify-center text-md cursor-pointer"
                                    onMouseEnter={() => setIsHoveringFollowButton(true)}
                                    onMouseLeave={() => setIsHoveringFollowButton(false)}
                                    onClick={isFollowing ? handleUnfollow : handleFollow}
                                > 
                                    {!isFollowing &&
                                        <p>+ Follow</p>
                                    }
                                    {isFollowing && !isHoveringFollowButton &&
                                        <>
                                            <CheckIcon className="text-positive-foreground" />
                                            <p>Following</p>
                                        </>
                                    }
                                    {isFollowing && isHoveringFollowButton &&
                                        <>
                                            <XIcon className="text-negative-foreground" />
                                            <p>Unfollow?</p>
                                        </> 
                                    }
                                </Button>
                            }
                            <p className="text-muted-foreground text-sm">
                                Joined {user.createdOnUTC.toLocaleDateString()}
                            </p>
                        </CardFooter>
                    </Card>
                    <div className={`${!isLg ? 'w-full' : 'min-w-[600px] flex-1'} bg-muted p-4 rounded-lg`}>
                        <p>Right section</p>
                    </div>
                </div>
            }

        </main>
    );
}