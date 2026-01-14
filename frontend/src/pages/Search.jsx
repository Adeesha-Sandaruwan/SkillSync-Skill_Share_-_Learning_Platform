import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PlanCard from '../components/PlanCard';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api, { getPublicPlans } from '../services/api';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);

    const [people, setPeople] = useState([]);
    const [plans, setPlans] = useState([]);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (!query) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch People
                const userRes = await api.get(`/users/search?q=${query}`);
                setPeople(userRes.data || []);

                // 2. Fetch Roadmaps (Courses)
                const planRes = await getPublicPlans(query, 'All', 'All');
                setPlans(planRes.data || []);

                // 3. Fetch Posts (Filtering client side as a fallback)
                const postRes = await api.get(`/posts?page=0&size=50`); // Fetch recent posts
                const allPosts = postRes.data || [];
                const filteredPosts = allPosts.filter(p =>
                    p.description?.toLowerCase().includes(query.toLowerCase()) ||
                    p.user?.username?.toLowerCase().includes(query.toLowerCase())
                );
                setPosts(filteredPosts);

            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchData, 300);
        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
                <h1 className="text-3xl font-black text-slate-800 mb-6">
                    Results for "<span className="text-indigo-600">{query}</span>"
                </h1>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto">
                    {['all', 'people', 'roadmaps', 'posts'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-2 font-bold text-sm capitalize whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><LoadingSpinner /></div>
                ) : (
                    <div className="space-y-12">
                        {/* PEOPLE SECTION */}
                        {(activeTab === 'all' || activeTab === 'people') && people.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">👥 People <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{people.length}</span></h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {people.map(person => (
                                        <div key={person.id} onClick={() => navigate(`/profile/${person.id}`)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all">
                                            <img src={person.avatarUrl || `https://ui-avatars.com/api/?name=${person.username}`} alt={person.username} className="w-12 h-12 rounded-full object-cover bg-slate-100" />
                                            <div>
                                                <h3 className="font-bold text-slate-900">{person.username}</h3>
                                                <p className="text-xs text-slate-500 line-clamp-1">{person.bio || 'No bio yet'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ROADMAPS SECTION */}
                        {(activeTab === 'all' || activeTab === 'roadmaps') && plans.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">🗺️ Roadmaps <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{plans.length}</span></h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {plans.map(plan => (
                                        <PlanCard key={plan.id} plan={plan} isOwner={false} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* POSTS SECTION */}
                        {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">📝 Posts <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{posts.length}</span></h2>
                                <div className="space-y-6 max-w-2xl">
                                    {posts.map(post => (
                                        <PostCard key={post.id} post={post} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {people.length === 0 && plans.length === 0 && posts.length === 0 && (
                            <div className="text-center py-20 opacity-50">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="font-bold text-lg">No results found.</p>
                                <p className="text-sm">Try searching for something else.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;