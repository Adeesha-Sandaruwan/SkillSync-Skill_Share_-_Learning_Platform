import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeFeed from './pages/HomeFeed';
import Profile from './pages/Profile';
import LearningPlans from './pages/LearningPlans';
import Notifications from './pages/Notifications'; // <--- Import Notifications

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Optional: Add a loading check here to prevent flashing "Login" on refresh
    if (loading) return <div>Loading...</div>;

    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-100 text-gray-900">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes */}
                        <Route path="/" element={
                            <PrivateRoute>
                                <HomeFeed />
                            </PrivateRoute>
                        } />

                        <Route path="/profile/:userId" element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        } />

                        {/* FIX 1: Wrapped in PrivateRoute */}
                        <Route path="/notifications" element={
                            <PrivateRoute>
                                <Notifications />
                            </PrivateRoute>
                        } />

                        {/* FIX 2: Changed path to match Navbar link (/learning-plans) */}
                        <Route path="/learning-plans" element={
                            <PrivateRoute>
                                <LearningPlans />
                            </PrivateRoute>
                        } />

                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;