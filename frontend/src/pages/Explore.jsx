import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PlanCard from '../components/PlanCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPublicPlans } from '../services/api';

const Explore = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryFromUrl = searchParams.get('q') || '';

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState(queryFromUrl);
    const [difficulty, setDifficulty] = useState('All');

    // Sync state if URL changes
    useEffect(() => {
        setSearch(queryFromUrl);
    }, [queryFromUrl]);

    // MAIN FETCH LOGIC
    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true);
            try {
                // Ensure "All" is converted to null/empty so backend ignores it
                // OR backend handles "All".
                // Based on your Backend Service code, it handles "All" correctly.
                // So we can send 'All' directly.

                const res = await getPublicPlans(search, difficulty, 'All');
                setPlans(res.data || []);
            } catch (error) {
                console.error("Failed to fetch explore content", error);
                setPlans([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchPlans();
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [search, difficulty]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        setSearchParams(val ? { q: val } : {});
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-1">
                                <span className="text-3xl">🌍</span> Explore Roadmaps
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">Discover learning paths created by the community.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search topic..."
                                    className="pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full font-bold text-slate-700 transition-all"
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                            </div>

                            <select
                                className="px-4 py-2.5 bg-slate-100 rounded-xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-200 w-full sm:w-auto"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="All">⚡ All Levels</option>
                                <option value="Beginner">🌱 Beginner</option>
                                <option value="Intermediate">🚀 Intermediate</option>
                                <option value="Advanced">🔥 Advanced</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <main className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh] pb-24 md:pb-8">
                {loading ? (
                    <div className="flex justify-center pt-32"><LoadingSpinner /></div>
                ) : plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
                        {plans.map(plan => (
                            <div key={plan.id} className="transform transition-all hover:-translate-y-1">
                                <PlanCard plan={plan} isOwner={false} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white/50 rounded-3xl border border-dashed border-slate-300 mx-auto max-w-2xl mt-10">
                        <div className="text-6xl mb-4 grayscale opacity-50">🔭</div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No roadmaps found.</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            We couldn't find any plans matching "{search}" with difficulty "{difficulty}".
                        </p>
                        <button onClick={() => { setSearch(''); setDifficulty('All'); setSearchParams({}); }} className="mt-6 text-indigo-600 font-bold hover:underline">
                            Clear Filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Explore;