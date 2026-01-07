import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    // SEARCH STATES
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isFocused, setIsFocused] = useState(false); // For animation
    const searchRef = useRef(null);

    useEffect(() => {
        if (user?.id) fetchUnreadCount();
    }, [user, location.pathname]);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get(`/notifications/${user.id}/unread-count`);
            setUnreadCount(response.data);
        } catch (error) { console.error(error); }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        setShowResults(true);

        try {
            const response = await api.get(`/users/search?q=${query}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavLink = ({ to, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className="relative px-2 py-2 group">
                <span className={`text-sm font-bold transition-colors duration-300 ${
                    isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-600'
                }`}>
                    {children}
                </span>
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transform transition-transform duration-300 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
            </Link>
        );
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16 gap-4">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 transition-transform group-hover:rotate-12">
                            S
                        </div>
                        <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900 tracking-tight hidden sm:block">
                            SkillSync
                        </span>
                    </Link>

                    {/* ANIMATED SEARCH BAR */}
                    <div className="flex-1 flex justify-center" ref={searchRef}>
                        <div className={`relative group transition-all duration-500 ease-out ${isFocused || searchQuery ? 'w-full max-w-lg' : 'w-full max-w-xs'}`}>

                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <svg className={`h-5 w-5 transition-colors duration-300 ${isFocused ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <input
                                type="text"
                                className={`block w-full pl-10 pr-10 py-2.5 rounded-full leading-5 placeholder-slate-400 focus:outline-none transition-all duration-300 ${
                                    isFocused
                                        ? 'bg-white border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg'
                                        : 'bg-slate-100/50 border-transparent hover:bg-slate-100 border hover:border-slate-200'
                                }`}
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={handleSearch}
                                onFocus={() => { setIsFocused(true); if(searchQuery.length >= 2) setShowResults(true); }}
                            />

                            {/* Clear Button or Spinner */}
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {isSearching ? (
                                    <LoadingSpinner variant="button" className="!w-4 !h-4" />
                                ) : searchQuery && (
                                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-slate-400 hover:text-slate-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {showResults && (
                                <div className="absolute mt-3 w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 origin-top">
                                    {searchResults.length > 0 ? (
                                        <ul className="max-h-80 overflow-y-auto custom-scrollbar">
                                            {searchResults.map((result) => (
                                                <li key={result.id}>
                                                    <Link
                                                        to={`/profile/${result.id}`}
                                                        onClick={() => { setShowResults(false); setIsFocused(false); }}
                                                        className="flex items-center px-4 py-3 hover:bg-indigo-50/50 transition-colors gap-3 border-b border-slate-50 last:border-0 group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 p-[2px] group-hover:from-blue-400 group-hover:to-indigo-500 transition-all">
                                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                                {result.avatarUrl ? (
                                                                    <img src={result.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                                ) : <span className="text-indigo-600 font-bold text-xs">{result.username.charAt(0).toUpperCase()}</span>}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{result.username}</p>
                                                            {result.firstname && <p className="text-xs text-slate-500">{result.firstname} {result.lastname}</p>}
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-4 py-8 text-center">
                                            <p className="text-sm text-slate-500 font-medium">No users found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
                        <NavLink to="/">Feed</NavLink>
                        <NavLink to="/learning-plans">Roadmap</NavLink>

                        <div className="relative">
                            <NavLink to="/notifications">Notifications</NavLink>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-2 flex h-5 w-5 pointer-events-none">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold items-center justify-center shadow-md">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                </span>
                            )}
                        </div>

                        {/* Profile & Logout */}
                        <div className="flex items-center gap-4 pl-6 border-l border-slate-200 ml-2">
                            <Link to={`/profile/${user?.id}`} className="flex items-center gap-3 group">
                                <div className="w-9 h-9 rounded-full ring-2 ring-indigo-50 p-0.5 transition-all group-hover:ring-indigo-300">
                                    <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-xs">
                                                {user?.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>

                            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;