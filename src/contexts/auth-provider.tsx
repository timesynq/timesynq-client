import { login, LoginError, LoginRequest } from "@/api/auth/login";
import { logout } from "@/api/auth/logout";
import { User, UserService } from "@/api/users/user";
import { Toasts } from "@/utils/toasts";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthProviderState {
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  authLogin: (loginRequest: LoginRequest) => Promise<void | LoginError>;
  authLogout: () => Promise<boolean>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProviderContext = createContext<AuthProviderState | undefined>(undefined);

export const AuthProvider = ({children}: AuthProviderProps) => {

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchUser = async (): Promise<void> => {
    try {
        const user = await UserService.me();
        setUser(user);
    }
    catch(error) {
        setUser(null);
    }
    finally{
      //await new Promise(f => setTimeout(f, 1000)); //todo: only run this in dev environment
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const authLogin = async (loginRequest: LoginRequest): Promise<void | LoginError> => {
    const error = await login(loginRequest);
      if (!error) {
        fetchUser();
      }
      return error;
  }

  const authLogout = async (): Promise<boolean> => {
    const isLogoutSuccessful: boolean = await logout((description: string) => Toasts.error(description));
    if(isLogoutSuccessful){
      setUser(null);
      setIsLoading(false);
      navigate('/');
    }
    return isLogoutSuccessful;
  }

  return(
    <AuthProviderContext.Provider value={{ user, isLoading, fetchUser, authLogin, authLogout }}>
      {children}
    </AuthProviderContext.Provider>
  );

}

export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  if(context === undefined){
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}