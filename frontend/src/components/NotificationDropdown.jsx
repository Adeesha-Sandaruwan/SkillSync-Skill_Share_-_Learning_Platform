import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const NotificationDropdown = ({ userId, onClose, onRead }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get(`/notifications/${userId}`);
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await api.put(`/notifications/${notification.id}/read`);
                onRead();
            }

            onClose();

            if (notification.type === 'FOLLOW') {
                navigate(`/profile/${notification.actor.id}`);
            } else if (notification.relatedPostId) {
                navigate(`/`);
            }
        } catch (error) {
            console.error("Error handling notification click");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put(`/notifications/${userId}/read-all`);
            onRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all read");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LIKE': return <span className="text-red-500 text-lg">❤️</span>;
            case 'COMMENT': return <span className="text-blue-500 text-lg">💬</span>;
            case 'FOLLOW': return <span className="text-green-500 text-lg">👤</span>;
            default: return <span>📢</span>;
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-down">
            <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-700 text-sm">Notifications</h3>
                <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Mark all read
                </button>
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-4 flex justify-center"><LoadingSpinner size="small" /></div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No notifications yet</div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.read ? 'bg-blue-50/50' : ''}`}
                        >
                            <div className="mt-1 flex-shrink-0">
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                    <span className="font-semibold">{notif.actor.username}</span> {notif.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            {!notif.read && (
                                <div className="self-center w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;