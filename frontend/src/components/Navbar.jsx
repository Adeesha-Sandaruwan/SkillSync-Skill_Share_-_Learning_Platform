import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* --- TOP NAVBAR (Sticky) --- */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 transition-all">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-black text-xl">S</span>
                        </div>
                        <span className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
                            SkillSync<span className="text-indigo-600">.</span>
                        </span>
                    </Link>

                    {/* SEARCH BAR (Hidden on very small screens, visible md+) */}
                    <div className="flex-1 max-w-md mx-4 hidden sm:block">
                        <form onSubmit={handleSearch} className="relative group">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-full text-sm font-medium text-slate-700 transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </form>
                    </div>

                    {/* DESKTOP NAV LINKS (Visible on Tablet+) */}
                    <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50">
                        <NavLink to="/" active={isActive('/')} icon={<HomeIcon />} text="Feed" />
                        <NavLink to="/explore" active={isActive('/explore')} icon={<CompassIcon />} text="Explore" />
                        <NavLink to="/leaderboard" active={isActive('/leaderboard')} icon={<TrophyIcon />} text="Rankings" />
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
                        <NotificationDropdown />

                        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

                        <div className="flex items-center gap-3">
                            <button onClick={handleLogout} className="hidden md:block text-xs font-bold text-slate-500 hover:text-red-500 transition-colors uppercase tracking-wide">
                                Sign Out
                            </button>
                            <Link to={`/profile/${user?.id}`} className="group relative hidden md:block">
                                <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}`} alt="Me" className="relative w-9 h-9 rounded-full bg-slate-200 border-2 border-white object-cover" />
                            </Link>
                            {/* Mobile Profile Icon (Top Right) */}
                            <Link to={`/profile/${user?.id}`} className="md:hidden">
                                <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}`} alt="Me" className="w-8 h-8 rounded-full border border-slate-200" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- MOBILE BOTTOM NAV (Fixed) --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-bottom">
                <MobileNavLink to="/" active={isActive('/')} icon={<HomeIcon />} label="Feed" />
                <MobileNavLink to="/explore" active={isActive('/explore')} icon={<CompassIcon />} label="Explore" />
                <MobileNavLink to="/leaderboard" active={isActive('/leaderboard')} icon={<TrophyIcon />} label="Rank" />
                <MobileNavLink to={`/profile/${user?.id}`} active={isActive(`/profile/${user?.id}`)} icon={<UserIcon />} label="Profile" />
            </div>
        </>
    );
};

const NavLink = ({ to, active, icon, text }) => (
    <Link to={to} className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all duration-200 ${active ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
        {icon}
        <span>{text}</span>
    </Link>
);

const MobileNavLink = ({ to, active, icon, label }) => (
    <Link to={to} className={`flex flex-col items-center gap-1 transition-colors duration-200 ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
        <div className={`p-1 rounded-xl ${active ? 'bg-indigo-50' : ''}`}>{icon}</div>
        {/* <span className="text-[10px] font-medium">{label}</span> Optional Label */}
    </Link>
);

// Icons...
const HomeIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>);
const CompassIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>);
const TrophyIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const UserIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);

export default Navbar;