import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeFeed from './pages/HomeFeed';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Leaderboard from './pages/Leaderboard';
import CreatePlan from './pages/CreatePlan';
import PlanDetails from './pages/PlanDetails';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat'; // Imported Chat
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes (Require Login) */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomeFeed />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/search" element={<Search />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/create-plan" element={<CreatePlan />} />
                <Route path="/plans/:planId" element={<PlanDetails />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/chat" element={<Chat />} /> {/* Chat Route Added Here */}
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;