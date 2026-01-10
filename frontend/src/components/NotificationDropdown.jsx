import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const NotificationDropdown = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // --- 1. FETCH NOTIFICATIONS ---
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const [listRes, countRes] = await Promise.all([
                api.get(`/notifications/${user.id}`),
                api.get(`/notifications/${user.id}/unread-count`)
            ]);
            setNotifications(listRes.data);
            setUnreadCount(countRes.data);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    // --- 2. POLL FOR UPDATES (Every 30s) ---
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Real-time feel
        return () => clearInterval(interval);
    }, [user]);

    // --- 3. HANDLE CLICKS ---
    const toggleDropdown = async () => {
        if (!isOpen && unreadCount > 0) {
            // Mark all as read when opening
            try {
                await api.put(`/notifications/${user.id}/read-all`);
                setUnreadCount(0);
            } catch (e) { console.error(e); }
        }
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notif) => {
        setIsOpen(false);
        // Navigate based on type
        if (notif.type === 'FOLLOW') {
            navigate(`/profile/${notif.actor.id}`);
        } else if (notif.relatedPostId) {
            // In a real app, you might want a single post view page.
            // For now, we go to the actor's profile or feed.
            // Let's assume we navigate to the feed or a specific post page if it existed.
            // Ideally: navigate(`/posts/${notif.relatedPostId}`);
            navigate(`/`); // Fallback to feed
        }
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper for Icon
    const getIcon = (type) => {
        switch (type) {
            case 'LIKE': return '❤️';
            case 'COMMENT': return '💬';
            case 'FOLLOW': return '👤';
            default: return '🔔';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* BELL BUTTON */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-100"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>

                {/* RED BADGE */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* DROPDOWN MENU */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in-down origin-top-right">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">Notifications</h3>
                        <button onClick={fetchNotifications} className="text-xs text-indigo-500 hover:underline">Refresh</button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-3 flex items-start gap-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                                >
                                    <img
                                        src={notif.actor.avatarUrl}
                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-800">
                                            <span className="font-bold">{notif.actor.username}</span> {notif.message}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <span>{getIcon(notif.type)}</span>
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notif.isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;