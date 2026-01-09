import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PlanCard from '../components/PlanCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPublicPlans } from '../services/api';

const Explore = () => {
    const [plans, setPlans] = useState([]);
    const [filteredPlans, setFilteredPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('All');

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await getPublicPlans();
                setPlans(res.data);
                setFilteredPlans(res.data);
            } catch (error) {
                console.error("Failed to fetch explore content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    useEffect(() => {
        let result = plans;

        if (search) {
            result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
        }

        if (difficulty !== 'All') {
            result = result.filter(p => p.difficulty === difficulty);
        }

        setFilteredPlans(result);
    }, [search, difficulty, plans]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Header / Search Section */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <span className="text-2xl">🌍</span> Explore Roadmaps
                        </h1>

                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search topic..."
                                className="px-4 py-2 bg-slate-100 rounded-lg border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <select
                                className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="All">All Levels</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center pt-20"><LoadingSpinner /></div>
                ) : filteredPlans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlans.map(plan => (
                            <PlanCard key={plan.id} plan={plan} isOwner={false} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔭</div>
                        <h3 className="text-xl font-bold text-slate-700">No roadmaps found.</h3>
                        <p className="text-slate-500">Try adjusting your filters or be the first to create one!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Explore;