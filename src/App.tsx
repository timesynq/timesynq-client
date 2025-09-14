import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Create from './pages/create';
import EmailConfirmed from './pages/email-confirmed';
import ForgotPassword from './pages/forgot-password';
import Profile from './pages/profile';
import Room from './pages/room';
import UserSearch from './pages/user-search';
import { ThemeProvider } from './components/theme-provider';

export default function App() {
    return (
        <ThemeProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<Create />} />
                <Route path="/email-confirmed" element={<EmailConfirmed />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile/:displayedUserId" element={<Profile />} />
                <Route path="/room" element={<Room />} />
                <Route path="/user-search" element={<UserSearch />} />
            </Routes>
        </ThemeProvider>
    );
}
