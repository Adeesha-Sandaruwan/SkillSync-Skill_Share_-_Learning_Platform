import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
                        <span className="text-white font-black text-lg">L</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                        LMS<span className="text-indigo-600">.</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
                    <NavLink to="/" active={isActive('/')} icon={<HomeIcon />} text="Feed" />
                    <NavLink to="/explore" active={isActive('/explore')} icon={<CompassIcon />} text="Explore" />
                    {/* NEW LEADERBOARD LINK */}
                    <NavLink to="/leaderboard" active={isActive('/leaderboard')} icon={<TrophyIcon />} text="Rankings" />
                    <NavLink to={`/profile/${user?.id}`} active={location.pathname.includes('/profile')} icon={<UserIcon />} text="Profile" />
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors"
                    >
                        Sign Out
                    </button>
                    <Link to={`/profile/${user?.id}`}>
                        <img
                            src={user?.avatarUrl}
                            alt="Me"
                            className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 object-cover"
                        />
                    </Link>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around z-50 pb-safe">
                <MobileNavLink to="/" active={isActive('/')} icon={<HomeIcon />} />
                <MobileNavLink to="/explore" active={isActive('/explore')} icon={<CompassIcon />} />
                <MobileNavLink to="/leaderboard" active={isActive('/leaderboard')} icon={<TrophyIcon />} />
                <MobileNavLink to={`/profile/${user?.id}`} active={location.pathname.includes('/profile')} icon={<UserIcon />} />
            </div>
        </nav>
    );
};

const NavLink = ({ to, active, icon, text }) => (
    <Link
        to={to}
        className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all duration-200 ${
            active
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
    >
        {icon}
        <span>{text}</span>
    </Link>
);

const MobileNavLink = ({ to, active, icon }) => (
    <Link
        to={to}
        className={`p-3 rounded-xl flex items-center justify-center transition-all ${
            active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'
        }`}
    >
        {icon}
    </Link>
);

// Icons
const HomeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const CompassIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
);
const TrophyIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

export default Navbar;