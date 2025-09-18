import { login, LoginError, LoginRequest } from '@/api/auth/login';
import { User, UserService } from '@/api/users/user';
import { create } from 'zustand';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    fetchUser: () => Promise<void>;
    login: (loginRequest: LoginRequest) => Promise<void | LoginError>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,

    fetchUser: async () => {
        set({ isLoading: true });
        try {
            const user = await UserService.me();
            set({ user, isLoading: false });
        }
        catch(error) {
            set({ user: null, isLoading:false });
        }
    },

    login: async (request: LoginRequest) => {
        const error = await login(request);
        if (!error) {
            const user = await UserService.me();
            set({ user });
        }
        return error;
    }
}));