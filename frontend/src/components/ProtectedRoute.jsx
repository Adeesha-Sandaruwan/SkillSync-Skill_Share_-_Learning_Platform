import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <LoadingSpinner />
            </div>
        );
    }

    // If no user is logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, render the child route (The App)
    return <Outlet />;
};

export default ProtectedRoute;