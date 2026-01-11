import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const NotificationDropdown = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(null);
    const dropdownRef = useRef(null);

    // --- 1. FETCH NOTIFICATIONS ---
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const [listRes, countRes] = await Promise.all([
                api.get(`/notifications/${user.id}`),
                api.get(`/notifications/${user.id}/unread-count`)
            ]);

            // Add a local property 'isFollowing' to handle UI state if backend doesn't send it
            const formattedNotifications = listRes.data.map(n => ({
                ...n,
                isFollowing: false // Default state
            }));

            setNotifications(formattedNotifications);
            setUnreadCount(countRes.data);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // --- 2. ACTIONS ---
    const toggleDropdown = async () => {
        if (!isOpen && unreadCount > 0) {
            try {
                await api.put(`/notifications/${user.id}/read-all`);
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (e) { console.error(e); }
        }
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notif) => {
        setIsOpen(false);
        if (notif.type === 'FOLLOW') {
            navigate(`/profile/${notif.actor.id}`);
        } else if (notif.relatedPostId) {
            navigate('/');
        }
    };

    // --- FIXED FOLLOW BACK LOGIC ---
    const handleFollowBack = async (e, actorId) => {
        e.stopPropagation();
        setLoadingFollow(actorId);

        try {
            await api.post(`/users/${actorId}/follow?followerId=${user.id}`);

            // --- UPDATE UI STATE IMMEDIATELY ---
            setNotifications(prevNotifications =>
                prevNotifications.map(n => {
                    // Mark ALL notifications from this user as followed
                    if (n.actor.id === actorId) {
                        return { ...n, isFollowing: true };
                    }
                    return n;
                })
            );

        } catch (error) {
            console.error("Failed to follow");
            alert("Could not follow user.");
        } finally {
            setLoadingFollow(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'LIKE': return <span className="text-red-500">❤️</span>;
            case 'COMMENT': return <span className="text-blue-500">💬</span>;
            case 'FOLLOW': return <span className="text-indigo-500">👤</span>;
            default: return <span className="text-slate-500">🔔</span>;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`relative p-2 rounded-xl transition-all ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <svg className="w-6 h-6" fill={isOpen ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-scale-in origin-top-right">
                    <div className="p-4 border-b border-slate-50 bg-white/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        <button onClick={fetchNotifications} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">
                            Refresh
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center flex flex-col items-center gap-3">
                                <span className="text-3xl grayscale opacity-30">🔕</span>
                                <p className="text-slate-400 text-sm font-medium">No new activity</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 cursor-pointer group ${!notif.isRead ? 'bg-indigo-50/40' : ''}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={notif.actor.avatarUrl}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                            alt={notif.actor.username}
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm text-xs">
                                            {getIcon(notif.type)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-600 leading-snug">
                                            <span className="font-bold text-slate-900 hover:underline" onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/profile/${notif.actor.id}`);
                                            }}>
                                                {notif.actor.username}
                                            </span>
                                            {' '}{notif.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </p>

                                        {/* --- DYNAMIC BUTTON LOGIC --- */}
                                        {notif.type === 'FOLLOW' && (
                                            <div className="mt-2">
                                                {notif.isFollowing ? (
                                                    <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg font-bold border border-slate-200">
                                                        Following
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={(e) => handleFollowBack(e, notif.actor.id)}
                                                        disabled={loadingFollow === notif.actor.id}
                                                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto disabled:opacity-50"
                                                    >
                                                        {loadingFollow === notif.actor.id ? 'Following...' : 'Follow Back'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {!notif.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <Link
                        to={`/profile/${user.id}`}
                        className="block p-3 text-center text-xs font-bold text-slate-500 hover:bg-slate-50 border-t border-slate-100 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        View Full History
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;