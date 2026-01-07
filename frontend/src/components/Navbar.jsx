import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? "text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-1 rounded-lg transition-all";

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                SkillSync
              </span>
                        </Link>
                    </div>

                    <div className="hidden sm:flex sm:items-center sm:space-x-4">
                        <Link to="/" className={isActive('/')}>Feed</Link>
                        <Link to={`/profile/${user?.id}`} className={isActive(`/profile/${user?.id}`)}>Profile</Link>
                        <Link to="/plans" className={isActive('/plans')}>Learning Plans</Link>

                        <div className="ml-4 flex items-center gap-4 pl-4 border-l border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end hidden md:flex">
                                    <span className="text-sm font-bold text-gray-900">{user?.username}</span>
                                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Member</span>
                                </div>

                                {/* AVATAR LOGIC */}
                                <Link to={`/profile/${user?.id}`} className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-blue-600 font-bold text-sm">
                            {user?.username?.charAt(0).toUpperCase()}
                        </span>
                                    )}
                                </Link>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                title="Logout"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;