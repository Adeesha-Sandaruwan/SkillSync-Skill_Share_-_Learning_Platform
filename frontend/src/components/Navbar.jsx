import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import NotificationDropdown from './NotificationDropdown';
import api, { getPublicPlans } from '../services/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // --- SEARCH STATES ---
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState({ people: [], plans: [], posts: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const searchRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- AUTOCOMPLETE LOGIC ---
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length < 2) {
                setSuggestions({ people: [], plans: [], posts: [] });
                return;
            }

            setLoadingSuggestions(true);
            const lowerQuery = searchQuery.toLowerCase();

            try {
                const [usersRes, plansRes, postsRes] = await Promise.allSettled([
                    api.get(`/users/search?q=${searchQuery}`),
                    getPublicPlans(searchQuery, 'All', 'All'),
                    api.get(`/posts?page=0&size=50`)
                ]);

                let filteredPosts = [];
                if (postsRes.status === 'fulfilled') {
                    const allPosts = postsRes.value.data || [];
                    filteredPosts = allPosts.filter(p =>
                        p.description?.toLowerCase().includes(lowerQuery) ||
                        p.user?.username?.toLowerCase().includes(lowerQuery)
                    ).slice(0, 3);
                }

                setSuggestions({
                    people: usersRes.status === 'fulfilled' ? (usersRes.value.data || []).slice(0, 3) : [],
                    plans: plansRes.status === 'fulfilled' ? (plansRes.value.data || []).slice(0, 3) : [],
                    posts: filteredPosts
                });
                setShowSuggestions(true);
            } catch (error) {
                console.error("Autofill failed", error);
            } finally {
                setLoadingSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSuggestionClick = (path) => {
        navigate(path);
        setShowSuggestions(false);
        setSearchQuery('');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* --- TOP NAVBAR --- */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0 active:scale-95 transition-transform">
                        <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all duration-300">
                            <span className="text-white font-black text-xl">S</span>
                        </div>
                        <span className="hidden md:block text-lg font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                            SkillSync
                        </span>
                    </Link>

                    {/* --- SEARCH BAR --- */}
                    <div className="flex-1 max-w-lg mx-2 sm:mx-6 relative" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative group">
                            {/* Decorative Glow - Added pointer-events-none to fix click issue */}
                            <div className={`absolute inset-0 bg-indigo-500/5 rounded-full transition-all duration-300 pointer-events-none ${showSuggestions ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}></div>

                            {/* Input - Added relative z-10 to sit on top */}
                            <input
                                type="text"
                                placeholder="Search..."
                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-transparent text-sm font-medium text-slate-700 transition-all duration-300 
                                    relative z-10
                                    focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:shadow-lg focus:shadow-indigo-500/5 outline-none 
                                    ${showSuggestions ? 'rounded-t-2xl border-b-slate-100' : 'rounded-full'}`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                            />

                            {/* Icon - Added pointer-events-none and z-20 */}
                            <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors duration-300 pointer-events-none z-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>

                            {/* Loading Spinner */}
                            {loadingSuggestions && (
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20">
                                    <div className="w-4 h-4 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                </div>
                            )}
                        </form>

                        {/* --- AUTOCOMPLETE DROPDOWN --- */}
                        {showSuggestions && (suggestions.people.length > 0 || suggestions.plans.length > 0 || suggestions.posts.length > 0) && (
                            <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-x border-b border-slate-200 shadow-2xl shadow-slate-200/50 rounded-b-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">

                                {/* People */}
                                {suggestions.people.length > 0 && (
                                    <div className="py-2">
                                        <h3 className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">People</h3>
                                        {suggestions.people.map(person => (
                                            <div key={person.id} onClick={() => handleSuggestionClick(`/profile/${person.id}`)} className="px-4 py-2.5 hover:bg-slate-50 active:bg-slate-100 cursor-pointer flex items-center gap-3 transition-colors">
                                                <img src={person.avatarUrl || `https://ui-avatars.com/api/?name=${person.username}`} className="w-8 h-8 rounded-full bg-slate-100 object-cover ring-2 ring-white shadow-sm" alt="Avatar" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{person.username}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">Lvl {person.level || 1}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Roadmaps */}
                                {suggestions.plans.length > 0 && (
                                    <div className="py-2 border-t border-slate-100">
                                        <h3 className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roadmaps</h3>
                                        {suggestions.plans.map(plan => (
                                            <div key={plan.id} onClick={() => handleSuggestionClick(`/plans/${plan.id}`)} className="px-4 py-2.5 hover:bg-slate-50 active:bg-slate-100 cursor-pointer flex items-center gap-3 transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm shadow-sm ring-1 ring-indigo-100">🗺️</div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{plan.title}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{plan.category}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Posts */}
                                {suggestions.posts.length > 0 && (
                                    <div className="py-2 border-t border-slate-100">
                                        <h3 className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discussions</h3>
                                        {suggestions.posts.map(post => (
                                            <div key={post.id} onClick={() => handleSuggestionClick(`/posts/${post.id}`)} className="px-4 py-2.5 hover:bg-slate-50 active:bg-slate-100 cursor-pointer flex items-center gap-3 transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shadow-sm ring-1 ring-emerald-100">💬</div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{post.description}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">by {post.user?.username}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                <div onClick={handleSearchSubmit} className="p-3 bg-slate-50/50 text-center border-t border-slate-100 hover:bg-slate-100 active:bg-slate-200 cursor-pointer transition-colors group">
                                    <span className="text-xs font-bold text-indigo-600 group-hover:underline">
                                        See all results for "{searchQuery}"
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- DESKTOP NAV LINKS --- */}
                    <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/60 backdrop-blur-md">
                        <NavLink to="/" active={isActive('/')} icon={<HomeIcon />} text="Feed" />
                        <NavLink to="/explore" active={isActive('/explore')} icon={<CompassIcon />} text="Explore" />
                        <NavLink to="/leaderboard" active={isActive('/leaderboard')} icon={<TrophyIcon />} text="Rank" />
                    </div>

                    {/* --- RIGHT ACTIONS --- */}
                    <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
                        <NotificationDropdown />

                        <div className="h-5 w-px bg-slate-200 hidden md:block mx-1"></div>

                        <div className="flex items-center gap-2">
                            {/* Mobile Logout (Touch Optimized) */}
                            <button
                                onClick={handleLogout}
                                className="md:hidden w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 active:scale-95 rounded-full transition-all duration-200"
                                aria-label="Sign Out"
                            >
                                <LogoutIcon />
                            </button>

                            {/* Desktop Logout */}
                            <button
                                onClick={handleLogout}
                                className="hidden md:block px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-95"
                            >
                                SIGN OUT
                            </button>

                            {/* Profile Link */}
                            <Link to={`/profile/${user?.id}`} className="group relative active:scale-95 transition-transform duration-200">
                                <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]"></div>
                                <img
                                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}`}
                                    alt="Me"
                                    className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm object-cover"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- MOBILE BOTTOM NAV --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 pb-safe pt-1 z-[90] shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center px-6 py-2">
                    <MobileNavLink to="/" active={isActive('/')} icon={<HomeIcon filled={isActive('/')} />} label="Feed" />
                    <MobileNavLink to="/explore" active={isActive('/explore')} icon={<CompassIcon filled={isActive('/explore')} />} label="Explore" />
                    <MobileNavLink to="/leaderboard" active={isActive('/leaderboard')} icon={<TrophyIcon filled={isActive('/leaderboard')} />} label="Rank" />
                    <MobileNavLink to={`/profile/${user?.id}`} active={isActive(`/profile/${user?.id}`)} icon={<UserIcon filled={isActive(`/profile/${user?.id}`)} />} label="Profile" />
                </div>
            </div>
        </>
    );
};

// --- SUB-COMPONENTS ---

const NavLink = ({ to, active, icon, text }) => (
    <Link to={to} className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all duration-300 active:scale-95 ${
        active
            ? 'bg-white text-indigo-600 shadow-[0_2px_8px_-2px_rgba(79,70,229,0.2)] ring-1 ring-black/5'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
    }`}>
        {icon}
        <span>{text}</span>
    </Link>
);

const MobileNavLink = ({ to, active, icon, label }) => (
    <Link to={to} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 active:scale-90 ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
        <div className={`transition-transform duration-300 ${active ? '-translate-y-0.5' : ''}`}>
            {icon}
        </div>
        <span className={`text-[10px] font-bold ${active ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'} transition-all duration-300`}>
            {label}
        </span>
    </Link>
);

// --- ICONS ---
const HomeIcon = ({ filled }) => (<svg className="w-6 h-6 transition-all" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "2" : "2"} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>);
const CompassIcon = ({ filled }) => (<svg className="w-6 h-6 transition-all" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "2" : "2"} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>);
const TrophyIcon = ({ filled }) => (<svg className="w-6 h-6 transition-all" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "2" : "2"} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const UserIcon = ({ filled }) => (<svg className="w-6 h-6 transition-all" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "2" : "2"} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const LogoutIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);

export default Navbar;