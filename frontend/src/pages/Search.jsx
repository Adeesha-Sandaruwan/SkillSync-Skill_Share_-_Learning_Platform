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
                // Fetch Data
                const [userRes, planRes, postRes] = await Promise.all([
                    api.get(`/users/search?q=${query}`),
                    getPublicPlans(query, 'All', 'All'),
                    api.get(`/posts?page=0&size=50`)
                ]);

                setPeople(userRes.data || []);
                setPlans(planRes.data || []);

                // Client-side filtering for posts
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

        const timeout = setTimeout(fetchData, 100);
        return () => clearTimeout(timeout);
    }, [query]);

    const SectionHeader = ({ icon, title, count }) => (
        <div className="flex items-center gap-3 mb-4 mt-8 px-1">
            <span className="text-xl">{icon}</span>
            <h2 className="text-lg font-black text-slate-800">{title}</h2>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {count}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-12">

                {/* --- HEADER --- */}
                <div className="mb-6">
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Search Results</p>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                        for <span className="text-indigo-600">“{query}”</span>
                    </h1>
                </div>

                {/* --- TABS --- */}
                <div className="sticky top-16 z-30 -mx-4 md:mx-0 mb-6">
                    <div className="bg-slate-50/90 backdrop-blur-xl border-b border-slate-200/50 md:bg-transparent md:backdrop-blur-none md:border-none">
                        <div className="flex gap-3 overflow-x-auto px-4 py-3 md:px-0 hide-scrollbar">
                            {[
                                { id: 'all', label: 'All', icon: '🔍' },
                                { id: 'people', label: 'People', icon: '👥' },
                                { id: 'roadmaps', label: 'Roadmaps', icon: '🗺️' },
                                { id: 'posts', label: 'Posts', icon: '📝' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 active:scale-95
                                        ${activeTab === tab.id
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                                    }
                                    `}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <div className="space-y-10 animate-fade-in">

                        {/* --- PEOPLE --- */}
                        {(activeTab === 'all' || activeTab === 'people') && people.length > 0 && (
                            <section>
                                <SectionHeader icon="👥" title="People" count={people.length} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {people.map(person => (
                                        <div
                                            key={person.id}
                                            onClick={() => navigate(`/profile/${person.id}`)}
                                            className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center gap-4 active:scale-[0.98]"
                                        >
                                            <img
                                                src={person.avatarUrl || `https://ui-avatars.com/api/?name=${person.username}`}
                                                alt={person.username}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-indigo-600 transition-colors">
                                                    {person.username}
                                                </h3>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {person.bio || 'SkillSync Member'}
                                                </p>
                                            </div>
                                            <div className="ml-auto text-slate-300 group-hover:text-indigo-600 text-xl transition-colors">→</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* --- ROADMAPS --- */}
                        {(activeTab === 'all' || activeTab === 'roadmaps') && plans.length > 0 && (
                            <section>
                                <SectionHeader icon="🗺️" title="Roadmaps" count={plans.length} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {plans.map(plan => (
                                        <div key={plan.id} className="transition-all hover:-translate-y-1 hover:shadow-xl rounded-3xl active:scale-[0.99]">
                                            <PlanCard plan={plan} isOwner={false} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* --- POSTS --- */}
                        {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
                            <section>
                                <SectionHeader icon="📝" title="Discussions" count={posts.length} />
                                <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto md:mx-0">
                                    {posts.map(post => (
                                        <div key={post.id} className="transition-opacity hover:opacity-100">
                                            <PostCard post={post} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* --- EMPTY STATE --- */}
                        {people.length === 0 && plans.length === 0 && posts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-4xl">
                                    🔭
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No results found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mb-8">
                                    We couldn't find anything for "{query}". Try searching for users, skills, or topics.
                                </p>
                                <button
                                    onClick={() => navigate('/explore')}
                                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
                                >
                                    Go to Explore
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;