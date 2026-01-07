import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user?.id) fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get(`/notifications/${user.id}`);
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put(`/notifications/${user.id}/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) { console.error("Error marking all read", error); }
    };

    const handleMarkOneRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        } catch (error) { console.error("Error marking read", error); }
    };

    if (loading) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="flex justify-center pt-20"><LoadingSpinner /></div></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800">Notifications</h1>
                    {notifications.some(n => !n.read) && (
                        <button onClick={handleMarkAllRead} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200">
                            <span className="text-4xl block mb-2">🔕</span>
                            <p className="text-slate-500 font-medium">No new notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification.id} onClick={() => !notification.read && handleMarkOneRead(notification.id)}
                                 className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-4 items-start ${
                                     !notification.read
                                         ? 'bg-white border-indigo-100 shadow-lg shadow-indigo-100/50 scale-[1.01]'
                                         : 'bg-white/60 border-transparent hover:bg-white hover:shadow-md'
                                 }`}>

                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                                            {notification.actor.avatarUrl ? (
                                                <img src={notification.actor.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-indigo-600">{notification.actor.username?.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                    </div>
                                    {!notification.read && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                                </div>

                                <div className="flex-1 pt-1">
                                    <p className="text-slate-800 text-[15px] leading-relaxed">
                                        <span className="font-bold text-indigo-900">{notification.actor.username}</span>
                                        {' '}{notification.message}
                                    </p>
                                    <span className="text-xs font-semibold text-slate-400 mt-2 block">
                                        {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;