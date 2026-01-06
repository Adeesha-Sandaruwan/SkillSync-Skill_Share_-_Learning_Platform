import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeFeed from './pages/HomeFeed';
import Profile from './pages/Profile'; // <--- Import Profile

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
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

                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;