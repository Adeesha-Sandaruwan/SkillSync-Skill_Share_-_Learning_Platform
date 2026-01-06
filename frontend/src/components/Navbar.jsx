import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-blue-600">SkillSync</Link>
                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-blue-500">Feed</Link>
                    <Link to={`/profile/${user?.id}`} className="text-gray-600 hover:text-blue-500">My Profile</Link>
                    <Link to="/plans" className="text-gray-600 hover:text-blue-500">Learning Plans</Link>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;