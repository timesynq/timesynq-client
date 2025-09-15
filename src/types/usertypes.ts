export type User = {
    id: string;
    userName: string;
    profilePicture: number;
    createdOnUTC: Date;
    followerCount: number;
    followeeCount: number;
}

export type Profile = {
    user: User;
    isFollowing: boolean;
}

export type UserSearchResults = {
    items: { user: User; }[];
}