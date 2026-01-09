import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeFeed from './pages/HomeFeed';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import CreatePlan from './pages/CreatePlan';   // <--- NEW
import PlanDetails from './pages/PlanDetails'; // <--- NEW

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-100 text-gray-900">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes */}
                        <Route path="/" element={<PrivateRoute><HomeFeed /></PrivateRoute>} />
                        <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

                        {/* New Learning Plan Routes */}
                        <Route path="/plans/create" element={<PrivateRoute><CreatePlan /></PrivateRoute>} />
                        <Route path="/plans/:planId" element={<PrivateRoute><PlanDetails /></PrivateRoute>} />

                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;