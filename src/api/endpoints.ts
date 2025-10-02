const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const addBaseToPath = (path: string): string => `${API_BASE_URL}${path}`;

export const endpoints = {
    auth: {
        register: () => addBaseToPath("/register"),
        login: (useCookies: boolean = true, useSessionCookies: boolean = true) => 
            addBaseToPath(`/login?useCookies=${useCookies}&useSessionCookies=${useSessionCookies}`),
        refreshCookie: (useSessionCookies: boolean = true) => addBaseToPath(`/refresh-cookie?useSessionCookies=${useSessionCookies}`),
        forgotPassword: () => addBaseToPath("/forgotPassword"),
        logout: () => addBaseToPath("/logout"),
        changePassword: () => addBaseToPath("/manage/info"),
        resetPassword: () => addBaseToPath("/resetPassword"),
        email: () => addBaseToPath("/manage/info"),
        changeEmail: () => addBaseToPath("/manage/info"),
        resendConfirmationEmail: () => addBaseToPath("/resendConfirmationEmail")
    },
    users: {
        me: () => addBaseToPath("/users/me"),
        getById: (id: string) => addBaseToPath(`/users/${id}`),
        profile: (id: string) => addBaseToPath(`/users/${id}/profile`),
        search: (searchString: string) => addBaseToPath(`/users/search/${searchString}`),
        changeUsername: () => addBaseToPath("/users/username"),
        delete: () => addBaseToPath("/users"), 
    },
    follow: {
        amIFollowing: (followeeId: string) => addBaseToPath(`/follows/${followeeId}`),
        followers: (userId: string) => addBaseToPath(`/follows/${userId}/followers`),
        followees: (userId: string) => addBaseToPath(`/follows/${userId}/followees`),
        follow: () => addBaseToPath("/follows"),
        unfollow: () => addBaseToPath("/follows"),
    },
}

export const hubs = {
    tracker: () => addBaseToPath("/tracker-hub"),
    refresh: () => addBaseToPath("/refresh-hub"),
}