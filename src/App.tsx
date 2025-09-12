import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Create from './pages/create';
import EmailConfirmed from './pages/email-confirmed';
import ForgotPassword from './pages/forgot-password';
import Profile from './pages/profile';
import PublicProfile from './pages/public-profile';
import Room from './pages/room';
import UserSearch from './pages/user-search';
import { ThemeProvider } from './components/theme-provider';

// For PublicProfile and Room, routes will need to be modified in order to include the username and room IDs respectively.

export default function App() {
    return (
        <ThemeProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<Create />} />
                <Route path="/email-confirmed" element={<EmailConfirmed />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/public-profile" element={<PublicProfile />} /> 
                <Route path="/room" element={<Room />} />
                <Route path="/user-search" element={<UserSearch />} />
            </Routes>
        </ThemeProvider>
    );
}
