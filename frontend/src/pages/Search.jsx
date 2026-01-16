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
                const [userRes, planRes, postRes] = await Promise.allSettled([
                    api.get(`/users/search?q=${encodeURIComponent(query)}`),
                    getPublicPlans(query, 'All', 'All'),
                    api.get(`/posts?page=0&size=50`)
                ]);

                if (userRes.status === 'fulfilled') setPeople(userRes.value.data || []);
                else setPeople([]);

                if (planRes.status === 'fulfilled') setPlans(planRes.value.data || []);
                else setPlans([]);

                if (postRes.status === 'fulfilled') {
                    const allPosts = postRes.value.data || [];
                    const lowerQuery = query.toLowerCase();
                    const filteredPosts = allPosts.filter(p => {
                        const descMatch = p.description && p.description.toLowerCase().includes(lowerQuery);
                        const userMatch = p.user && p.user.username && p.user.username.toLowerCase().includes(lowerQuery);
                        return descMatch || userMatch;
                    });
                    setPosts(filteredPosts);
                } else {
                    setPosts([]);
                }

            } catch (error) {
                console.error("Search failed completely", error);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchData, 100);
        return () => clearTimeout(timeout);
    }, [query]);

    // Calculate totals for conditional rendering
    const totalResults = people.length + plans.length + posts.length;

    // --- SUB-COMPONENTS FOR CLEANER JSX ---

    const SectionTitle = ({ icon, title, count }) => (
        <div className="flex items-center gap-3 mb-6 mt-2 px-1">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-sm">
                {icon}
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
            {count !== undefined && (
                <span className="bg-slate-200 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {count}
                </span>
            )}
        </div>
    );

    const UserCard = ({ person }) => (
        <div
            onClick={() => navigate(`/profile/${person.id}`)}
            className="group relative bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center gap-4 overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>
            <img
                src={person.avatarUrl || `https://ui-avatars.com/api/?name=${person.username}`}
                alt={person.username}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-50 group-hover:border-indigo-100 transition-colors"
            />
            <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-indigo-600 transition-colors">
                    {person.username}
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate mb-1">
                    {person.bio || 'SkillSync Member'}
                </p>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600">
                        Lvl {person.level || 1}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Hides scrollbar but keeps functionality */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">

                {/* --- HEADER --- */}
                <div className="mb-8">
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mb-2">Search Results</p>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">“{query}”</span>
                    </h1>
                </div>

                {/* --- STATIC TABS (Scrolls away) --- */}
                <div className="relative -mx-4 sm:mx-0 mb-8 pt-2">
                    <div className="bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/60 sm:bg-transparent sm:backdrop-blur-none sm:border-none px-4 sm:px-0">
                        <div className="flex gap-2 overflow-x-auto py-3 hide-scrollbar sm:flex-wrap">
                            {[
                                { id: 'all', label: 'All Results', icon: '🔍' },
                                { id: 'people', label: 'People', icon: '👥', count: people.length },
                                { id: 'roadmaps', label: 'Roadmaps', icon: '🗺️', count: plans.length },
                                { id: 'posts', label: 'Discussions', icon: '💬', count: posts.length }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 active:scale-95 border
                                        ${activeTab === tab.id
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 shadow-sm'
                                    }
                                    `}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                    {tab.count !== undefined && tab.id !== 'all' && (
                                        <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <LoadingSpinner size="lg" />
                        <p className="text-slate-400 text-sm font-medium mt-4 animate-pulse">Searching the universe...</p>
                    </div>
                ) : totalResults === 0 ? (
                    /* --- EMPTY STATE --- */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center mb-6 text-5xl">
                            🔭
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">No matches found</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                            We couldn't find anything matching "<strong>{query}</strong>". <br />
                            Try checking for typos or use broader keywords.
                        </p>
                        <button
                            onClick={() => navigate('/explore')}
                            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all active:scale-95"
                        >
                            Explore Trending
                        </button>
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* --- PEOPLE SECTION --- */}
                        {(activeTab === 'all' || activeTab === 'people') && people.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-2">
                                    <SectionTitle icon="👥" title="People" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {people.map(person => (
                                        <UserCard key={person.id} person={person} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* --- ROADMAPS SECTION --- */}
                        {(activeTab === 'all' || activeTab === 'roadmaps') && plans.length > 0 && (
                            <section>
                                <SectionTitle icon="🗺️" title="Learning Roadmaps" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {plans.map(plan => (
                                        <div key={plan.id} className="h-full">
                                            <PlanCard plan={plan} isOwner={false} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* --- POSTS SECTION --- */}
                        {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
                            <section>
                                <SectionTitle icon="💬" title="Discussions & Posts" />
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Center Feed Column */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {posts.map(post => (
                                            <div key={post.id} className="transition-all hover:scale-[1.01]">
                                                <PostCard post={post} />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Optional Sidebar or Empty Space for large screens */}
                                    <div className="hidden lg:block">
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg sticky top-32">
                                            <h3 className="font-bold text-lg mb-2">Did you know?</h3>
                                            <p className="text-indigo-100 text-sm mb-4">
                                                You can filter your search using the tabs above to narrow down exactly what you're looking for.
                                            </p>
                                            <div className="w-full h-1 bg-white/20 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;