import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
// Ensure LoadingSpinner exists in your components, otherwise remove import and use the div fallback
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    // 1. Show a spinner while checking auth (prevents premature redirect)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                {/* Fallback spinner logic */}
                {typeof LoadingSpinner !== 'undefined' ? <LoadingSpinner /> : (
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                )}
            </div>
        );
    }

    // 2. If no user is logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Otherwise, render the child route (The App)
    return <Outlet />;
};

export default ProtectedRoute;