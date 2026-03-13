import { Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/home';
import { Create } from './pages/create';
import { EmailConfirmed } from './pages/email-confirmed';
import { ForgotPassword } from './pages/forgot-password';
import { Profile } from './pages/profile';
import { Room } from './pages/room';
import { Explore } from './pages/explore';
import { ThemeProvider } from './contexts/theme-provider';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/auth-provider';
import { PrivateRoute } from './private-route';
import { NavBar } from './components/nav-bar';
import { useIsMobile } from './hooks/use-mobile';
import { NavBarFooter } from './components/nav-bar-footer';
import { AccountSettings } from './pages/account-settings';

export default function App() {

    const isMobile = useIsMobile();
    const location = useLocation();

    const isHeightFixed: boolean = location.pathname.startsWith("/room/")

    return (
        <AuthProvider>
            <ThemeProvider>
                <Toaster
                    visibleToasts={1}
                    duration={4000}
                    toastOptions={{
                        style: {
                            color: 'var(--foreground)',
                            background: 'var(--card)',
                            borderColor: 'var(--border)',
                            fontFamily: 'Pixuf, sans-serif',
                        },
                        classNames: {
                            title: 'text-lg',
                            description: '!text-(--foreground) text-base',
                        }
                    }}
                />
                <div className={`flex flex-col ${isHeightFixed ? "h-screen" : "min-h-screen"}`}>
                    <NavBar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/email-confirmed" element={<EmailConfirmed />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route 
                            path="/create" 
                            element={
                                <PrivateRoute>
                                    <Create />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/profile/:displayedUserId" 
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } 
                        />
                        <Route
                            path="/account-settings"
                            element={
                                <PrivateRoute>
                                    <AccountSettings />
                                </PrivateRoute>
                            } 
                        /> 
                        <Route 
                            path="/room/:wipId"
                            element={
                                <PrivateRoute>
                                    <Room />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/explore"
                            element={
                                <PrivateRoute>
                                    <Explore />
                                </PrivateRoute>
                            } 
                        />
                    </Routes>
                    {isMobile && <NavBarFooter />}
                </div>
            </ThemeProvider>
        </AuthProvider>
    );
}
