import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const SuggestionSidebar = () => {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!user) return;
            try {
                const res = await api.get(`/users/${user.id}/suggestions`);
                setSuggestions(res.data);
            } catch (error) {
                console.error("Failed to load suggestions");
            }
        };
        fetchSuggestions();
    }, [user]);

    if (suggestions.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">💎</span> Who to Follow
            </h3>
            <div className="space-y-4">
                {suggestions.map(u => (
                    <div key={u.id} className="flex items-center justify-between group">
                        <Link to={`/profile/${u.id}`} className="flex items-center gap-3">
                            <img
                                src={u.avatarUrl}
                                className="w-10 h-10 rounded-full object-cover border border-slate-100 group-hover:border-indigo-200 transition-colors"
                            />
                            <div>
                                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 truncate max-w-[100px]">
                                    {u.username}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Lvl {u.level || 1} • {u.xp || 0} XP
                                </p>
                            </div>
                        </Link>
                        <Link
                            to={`/profile/${u.id}`}
                            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                        >
                            View
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestionSidebar;