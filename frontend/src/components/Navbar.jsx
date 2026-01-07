import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get(`/notifications/${user.id}/unread-count`);
            setUnreadCount(response.data);
        } catch (error) {
            console.error("Failed to fetch notification count");
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">L</div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">LearnSphere</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Feed</Link>
                        <Link to="/learning" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Learning Plans</Link>

                        {/* NOTIFICATION BELL */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="text-gray-500 hover:text-blue-600 transition-colors relative p-1"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                                )}
                            </button>

                            {showNotifications && (
                                <NotificationDropdown
                                    userId={user.id}
                                    onClose={() => setShowNotifications(false)}
                                    onRead={fetchUnreadCount}
                                />
                            )}
                        </div>

                        {/* USER MENU */}
                        <div className="relative ml-3">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 focus:outline-none">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden border border-gray-200">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Av" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.username?.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 animate-fade-in-down">
                                    <Link to={`/profile/${user?.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Your Profile</Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;