import { Routes, Route } from 'react-router-dom';
import TestPage from './pages/TestPage';
export default function App() {
    return (
        <Routes>
            <Route path="/" element={<TestPage />} />
        </Routes>
    );
}

