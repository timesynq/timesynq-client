import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/home';
import { Create } from './pages/create';
import { EmailConfirmed } from './pages/email-confirmed';
import { ForgotPassword } from './pages/forgot-password';
import { Profile } from './pages/profile';
import { Room } from './pages/room';
import { Explore } from './pages/explore';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';

export default function App() {
    return (
        <ThemeProvider>
            <Toaster
                visibleToasts={1}
                duration={4000}
                toastOptions={{
                    style: {
                        color: 'var(--destructive)',
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
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<Create />} />
                <Route path="/email-confirmed" element={<EmailConfirmed />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile/:displayedUserId" element={<Profile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/room" element={<Room />} />
                <Route path="/explore" element={<Explore />} />
            </Routes>
        </ThemeProvider>
    );
}
