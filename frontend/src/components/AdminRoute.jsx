import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const AdminRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return (user && user.role === 'ADMIN') ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;