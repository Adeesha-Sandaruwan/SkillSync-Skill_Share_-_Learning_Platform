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
import Chat from './pages/Chat';
import LandingPage from './pages/LandingPage'; // <-- IMPORT THIS
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} /> {/* Default to Landing Page */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes (Require Login) */}
            <Route element={<ProtectedRoute />}>
                <Route path="/feed" element={<HomeFeed />} /> {/* Feed moved to /feed */}
                <Route path="/explore" element={<Explore />} />
                <Route path="/search" element={<Search />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/create-plan" element={<CreatePlan />} />
                <Route path="/plans/:planId" element={<PlanDetails />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/chat" element={<Chat />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;