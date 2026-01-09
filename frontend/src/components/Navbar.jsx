import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

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
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef(null);

    // MOBILE MENU STATE
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (user?.id) fetchUnreadCount();
    }, [user, location.pathname]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [location]);

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
            <Link to={to} className="relative px-2 py-2 group block w-full md:w-auto">
                <span className={`text-sm font-bold transition-colors duration-300 ${
                    isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-600'
                }`}>
                    {children}
                </span>
                <span className={`hidden md:block absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transform transition-transform duration-300 origin-left ${
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

                    {/* SEARCH BAR */}
                    <div className="flex-1 flex justify-center max-w-[200px] sm:max-w-lg mx-2" ref={searchRef}>
                        <div className={`relative group w-full transition-all duration-500`}>
                            <input
                                type="text"
                                className="block w-full pl-8 pr-8 py-2 rounded-full text-sm bg-slate-100/50 border-transparent hover:bg-slate-100 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearch}
                                onFocus={() => { setIsFocused(true); if(searchQuery.length >= 2) setShowResults(true); }}
                            />
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            {/* Dropdown Results */}
                            {showResults && (
                                <div className="absolute mt-3 w-[80vw] sm:w-full -left-10 sm:left-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-50">
                                    {searchResults.length > 0 ? (
                                        <ul className="max-h-60 overflow-y-auto">
                                            {searchResults.map((result) => (
                                                <li key={result.id}>
                                                    <Link to={`/profile/${result.id}`} className="flex items-center px-4 py-3 hover:bg-indigo-50 gap-3 border-b border-slate-50 last:border-0">
                                                        <img src={result.avatarUrl || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full object-cover" alt=""/>
                                                        <span className="text-sm font-bold text-slate-700">{result.username}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-slate-500">No users found.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DESKTOP MENU */}
                    <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
                        <NavLink to="/">Feed</NavLink>
                        {/* NEW EXPLORE LINK */}
                        <NavLink to="/explore">Explore</NavLink>
                        <NavLink to="/plans/create">Roadmaps</NavLink>

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

                        {/* Desktop Profile & Logout */}
                        <div className="flex items-center gap-4 pl-6 border-l border-slate-200 ml-2">
                            <Link to={`/profile/${user?.id}`} className="w-9 h-9 rounded-full ring-2 ring-indigo-50 p-0.5 overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-xs rounded-full">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </Link>
                            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU DROPDOWN */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl animate-fade-in-down">
                    <div className="p-4 space-y-4">
                        <Link to={`/profile/${user?.id}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : <span className="font-bold text-indigo-600">{user?.username?.charAt(0).toUpperCase()}</span>}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">{user?.username}</p>
                                <p className="text-xs text-slate-500">View Profile</p>
                            </div>
                        </Link>

                        <div className="space-y-1">
                            <Link to="/" className="block px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">Feed</Link>
                            <Link to="/explore" className="block px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">Explore</Link>
                            <Link to="/plans/create" className="block px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">Roadmap</Link>
                            <Link to="/notifications" className="flex justify-between items-center px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">
                                <span>Notifications</span>
                                {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
                            </Link>
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;