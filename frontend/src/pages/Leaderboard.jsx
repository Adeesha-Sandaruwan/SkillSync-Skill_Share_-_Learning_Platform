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
                console.error("Failed to load leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingSpinner /></div>;

    const topThree = users.slice(0, 3);
    const runnersUp = users.slice(3);

    const getMedalColor = (index) => {
        if (index === 0) return 'from-yellow-300 to-yellow-500 shadow-yellow-500/50'; // Gold
        if (index === 1) return 'from-slate-300 to-slate-400 shadow-slate-500/50'; // Silver
        if (index === 2) return 'from-amber-600 to-amber-700 shadow-amber-600/50'; // Bronze
        return 'from-slate-100 to-slate-200';
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar />

            <div className="bg-slate-900 pb-24 pt-10 px-4 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                        Global Leaderboard
                    </h1>
                    <p className="text-slate-400 font-medium">Top learners making an impact</p>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 -mt-16 relative z-20">

                {/* --- THE PODIUM (TOP 3) --- */}
                {topThree.length > 0 && (
                    <div className="flex justify-center items-end gap-2 md:gap-4 mb-8">
                        {/* 2nd Place */}
                        {topThree[1] && <PodiumUser user={topThree[1]} rank={2} color={getMedalColor(1)} height="h-32 md:h-40" />}

                        {/* 1st Place */}
                        {topThree[0] && <PodiumUser user={topThree[0]} rank={1} color={getMedalColor(0)} height="h-40 md:h-52" isWinner />}

                        {/* 3rd Place */}
                        {topThree[2] && <PodiumUser user={topThree[2]} rank={3} color={getMedalColor(2)} height="h-28 md:h-36" />}
                    </div>
                )}

                {/* --- THE LIST (4-10) --- */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    {runnersUp.map((user, index) => (
                        <div
                            key={user.id}
                            className={`flex items-center p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${currentUser?.id === user.id ? 'bg-indigo-50/50' : ''}`}
                        >
                            <div className="w-8 font-bold text-slate-400 text-lg">#{index + 4}</div>

                            <Link to={`/profile/${user.id}`} className="flex items-center gap-4 flex-1">
                                <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                                <div>
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        {user.username}
                                        {currentUser?.id === user.id && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">YOU</span>}
                                    </h4>
                                    <div className="text-xs text-slate-500 font-medium">Level {user.level || 1} • {user.xp || 0} XP</div>
                                </div>
                            </Link>

                            <div className="flex gap-1">
                                {user.badges?.slice(0,2).map(b => (
                                    <span key={b} className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold" title={b}>
                                        {b === 'NOVICE' ? '🌱' : b === 'MASTER' ? '👑' : '🏅'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}

                    {users.length === 0 && <div className="text-center py-10 text-slate-500">No data yet.</div>}
                </div>
            </main>
        </div>
    );
};

// Sub-component for Podium
const PodiumUser = ({ user, rank, color, height, isWinner }) => (
    <div className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-2">
        <Link to={`/profile/${user.id}`} className="relative mb-2">
            <div className={`rounded-full p-1 bg-gradient-to-tr ${color} ${isWinner ? 'w-20 h-20 md:w-24 md:h-24' : 'w-16 h-16 md:w-20 md:h-20'}`}>
                <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover border-2 border-white" alt={user.username} />
            </div>
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-white font-black border-2 border-white bg-gradient-to-br ${color} text-xs md:text-sm shadow-md`}>
                {rank}
            </div>
        </Link>

        <div className={`w-20 md:w-28 bg-gradient-to-b from-white/20 to-transparent backdrop-blur-sm rounded-t-lg flex flex-col items-center justify-end pb-2 ${height}`}>
            <h3 className={`font-bold text-white text-center text-xs md:text-sm truncate w-full px-2 ${isWinner ? 'text-lg' : ''}`}>
                {user.username}
            </h3>
            <span className="text-indigo-200 text-[10px] md:text-xs font-bold">{user.xp || 0} XP</span>
        </div>
    </div>
);

export default Leaderboard;