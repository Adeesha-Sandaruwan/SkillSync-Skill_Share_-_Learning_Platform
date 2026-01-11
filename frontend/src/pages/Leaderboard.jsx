import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';

const Leaderboard = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/users/leaderboard');
                setUsers(res.data);
            } catch (error) {
                console.error("Failed to load leaderboard");
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingSpinner /></div>;

    const topThree = users.slice(0, 3);
    const runnersUp = users.slice(3);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="bg-[#0f172a] relative overflow-hidden pb-32 pt-12">
                {/* Abstract BG */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                        Weekly Ranking
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                        Global Leaderboard
                    </h1>
                    <p className="text-slate-400 font-medium">Top learners making an impact.</p>
                </div>
            </div>

            {/* --- PODIUM SECTION --- */}
            <main className="max-w-4xl mx-auto px-4 -mt-24 relative z-20 pb-20">
                {topThree.length > 0 && (
                    <div className="flex justify-center items-end gap-3 md:gap-6 mb-10">
                        {/* 2nd Place */}
                        {topThree[1] && <PodiumCard user={topThree[1]} rank={2} height="h-44" color="border-slate-300 bg-slate-100" emoji="🥈" />}

                        {/* 1st Place */}
                        {topThree[0] && <PodiumCard user={topThree[0]} rank={1} height="h-56" color="border-yellow-300 bg-yellow-50 shadow-yellow-500/20" emoji="👑" isWinner />}

                        {/* 3rd Place */}
                        {topThree[2] && <PodiumCard user={topThree[2]} rank={3} height="h-36" color="border-orange-300 bg-orange-50" emoji="🥉" />}
                    </div>
                )}

                {/* --- RUNNERS UP LIST --- */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Rank & User</span>
                        <span>Experience (XP)</span>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {runnersUp.map((user, index) => (
                            <div
                                key={user.id}
                                className={`flex items-center p-4 hover:bg-slate-50 transition-all group ${currentUser?.id === user.id ? 'bg-indigo-50/40' : ''}`}
                            >
                                <div className="w-10 font-black text-slate-300 text-lg group-hover:text-indigo-300 transition-colors">
                                    #{index + 4}
                                </div>

                                <Link to={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative">
                                        <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:border-indigo-300 transition-colors" />
                                        {currentUser?.id === user.id && <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                                            {user.username}
                                        </h4>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            Lvl {user.level || 1}
                                        </span>
                                    </div>
                                </Link>

                                <div className="font-black text-slate-700 tabular-nums">
                                    {user.xp?.toLocaleString() || 0} <span className="text-xs text-slate-400 font-bold">XP</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {users.length === 0 && <div className="p-10 text-center text-slate-400">No leaderboard data yet.</div>}
                </div>
            </main>
        </div>
    );
};

// Podium Component
const PodiumCard = ({ user, rank, height, color, emoji, isWinner }) => (
    <div className="flex flex-col items-center group w-24 md:w-32">
        <Link to={`/profile/${user.id}`} className="relative mb-3 transition-transform hover:-translate-y-2">
            <div className={`p-1 rounded-full border-4 ${isWinner ? 'border-yellow-400' : 'border-white'} shadow-lg bg-white`}>
                <img src={user.avatarUrl} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md text-lg border border-slate-100">
                {emoji}
            </div>
        </Link>

        <div className={`w-full ${height} ${color} border-t-4 rounded-t-2xl shadow-lg flex flex-col items-center justify-end pb-4 relative overflow-hidden`}>
            {isWinner && <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent"></div>}

            <h3 className="font-bold text-slate-800 text-sm truncate w-full px-2 text-center relative z-10">
                {user.username}
            </h3>
            <span className="text-xs font-black text-slate-500/80 relative z-10">
                {user.xp || 0} XP
            </span>
            <div className="mt-2 text-4xl font-black text-black/5 absolute top-2">{rank}</div>
        </div>
    </div>
);

export default Leaderboard;