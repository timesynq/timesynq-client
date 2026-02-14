import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/home';
import { Create } from './pages/create';
import { EmailConfirmed } from './pages/email-confirmed';
import { ForgotPassword } from './pages/forgot-password';
import { Profile } from './pages/profile';
import { Room } from './pages/room';
import { Explore } from './pages/explore';
import { ThemeProvider } from './contexts/theme-provider';
import { Toaster } from 'sonner';
import { Tracker } from './tracker/tracker-page';
import { Sandbox } from './sandbox/sandbox-landing-page';
import { AuthProvider } from './contexts/auth-provider';
import { PrivateRoute } from './private-route';
import { NavBar } from './components/nav-bar';
import { useIsMobile } from './hooks/use-mobile';
import { NavBarFooter } from './components/nav-bar-footer';
import { AccountSettings } from './pages/account-settings';
import { TrackerHubProvider } from './contexts/tracker-hub-provider';

export default function App() {

    const isMobile = useIsMobile();
    const isSandbox = import.meta.env.VITE_SANDBOX_MODE === "true";

    return (
        <AuthProvider>
            <TrackerHubProvider>
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
                    <div className="flex flex-col min-h-screen">
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
                                path="/room/:roomCode"
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
                            {/* Sandbox routes */}
                            {isSandbox && (
                                <>
                                <Route path="/sandbox" element={<Sandbox />} />
                                <Route path="/sandbox/tracker" element={<Tracker />} />
                                </>
                            )}
                        </Routes>
                        {isMobile && <NavBarFooter />}
                    </div>
                </ThemeProvider>
            </TrackerHubProvider>
        </AuthProvider>
    );
}
