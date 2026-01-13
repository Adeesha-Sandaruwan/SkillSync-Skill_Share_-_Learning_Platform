import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import PlanCard from '../components/PlanCard';
import ProgressCard from '../components/ProgressCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EditProfileModal from '../components/EditProfileModal';
import AddPortfolioModal from '../components/AddPortfolioModal';
import ShortsViewer from '../components/ShortsViewer';
import { useAuth } from '../context/useAuth';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [userPlans, setUserPlans] = useState([]);
    const [progressUpdates, setProgressUpdates] = useState([]);
    const [portfolio, setPortfolio] = useState({ experience: [], certificates: [], skills: [] });
    const [postsPage, setPostsPage] = useState(0);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const postsObserver = useRef();
    const [stats, setStats] = useState({ totalLikes: 0, totalPosts: 0, totalPlans: 0, totalStepsCompleted: 0, followers: 0, following: 0 });
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [shortsIndex, setShortsIndex] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [newUpdate, setNewUpdate] = useState('');
    const [updateType, setUpdateType] = useState('LEARNING');
    const [submittingUpdate, setSubmittingUpdate] = useState(false);

    const fetchProfileData = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const userRes = await api.get(`/users/${userId}`);
            setProfileUser(userRes.data);
            try { const statsRes = await api.get(`/users/${userId}/stats`); setStats(statsRes.data); } catch (e) {}
            const fetchContent = async () => {
                try {
                    const [plansRes, progressRes, portfolioRes] = await Promise.all([
                        api.get(`/users/${userId}/plans`), api.get(`/users/${userId}/progress`), api.get(`/portfolio/${userId}`)
                    ]);
                    setUserPlans(plansRes.data); setProgressUpdates(progressRes.data); setPortfolio(portfolioRes.data);
                } catch (e) {}
            };
            await fetchContent();
            if (currentUser && currentUser.id && String(currentUser.id) !== String(userId)) {
                try { const followRes = await api.get(`/users/${userId}/is-following?followerId=${currentUser.id}`); setIsFollowing(followRes.data); } catch (e) {}
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [userId, currentUser]);

    const fetchUserPosts = useCallback(async () => {
        if (!userId) return;
        setLoadingPosts(true);
        try {
            const res = await api.get(`/posts/user/${userId}?page=${postsPage}&size=10`);
            const newPosts = res.data;
            setPosts(prev => postsPage === 0 ? newPosts : [...prev, ...newPosts]);
            setHasMorePosts(newPosts.length === 10);
        } catch (error) { console.error(error); } finally { setLoadingPosts(false); }
    }, [userId, postsPage]);

    useEffect(() => { fetchProfileData(); }, [fetchProfileData]);
    useEffect(() => { if (activeTab === 'posts') fetchUserPosts(); }, [fetchUserPosts, activeTab]);

    const lastPostRef = useCallback(node => {
        if (loadingPosts) return;
        if (postsObserver.current) postsObserver.current.disconnect();
        postsObserver.current = new IntersectionObserver(entries => { if (entries[0].isIntersecting && hasMorePosts) setPostsPage(prev => prev + 1); });
        if (node) postsObserver.current.observe(node);
    }, [loadingPosts, hasMorePosts]);

    const refreshPortfolio = async () => { const res = await api.get(`/portfolio/${userId}`); setPortfolio(res.data); };
    const handleDeleteItem = async (type, id) => { if(!window.confirm("Delete?")) return; try { await api.delete(`/portfolio/${type}/${id}`); refreshPortfolio(); } catch (error) { alert("Failed"); } };
    const handleFollowToggle = async () => {
        if (!currentUser) return;
        setLoadingFollow(true);
        try {
            if (isFollowing) { await api.post(`/users/${userId}/unfollow?followerId=${currentUser.id}`); setIsFollowing(false); setStats(p => ({ ...p, followers: Math.max(0, p.followers - 1) })); }
            else { await api.post(`/users/${userId}/follow?followerId=${currentUser.id}`); setIsFollowing(true); setStats(p => ({ ...p, followers: p.followers + 1 })); }
        } catch (error) { console.error(error); } finally { setLoadingFollow(false); }
    };
    const handlePostUpdate = async (e) => {
        e.preventDefault();
        if (!newUpdate.trim()) return;
        setSubmittingUpdate(true);
        try {
            const response = await api.post(`/users/${currentUser.id}/progress`, { content: newUpdate, type: updateType });
            setProgressUpdates([response.data, ...progressUpdates]); setNewUpdate(''); setUpdateType('LEARNING');
        } catch (error) { alert("Failed"); } finally { setSubmittingUpdate(false); }
    };
    const handleDeletePlan = (id) => { setUserPlans(p => p.filter(pl => pl.id !== id)); setStats(p => ({...p, totalPlans: p.totalPlans - 1})); };
    const handleUpdatePost = (postId, updatedPost) => { setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p)); };

    if (loading) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="flex justify-center h-[60vh] items-center"><LoadingSpinner variant="page"/></div></div>;
    if (!profileUser) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="text-center pt-20">User not found</div></div>;

    const isOwner = currentUser?.id === profileUser.id;
    const TypeButton = ({ type, icon, label, color }) => (
        <button type="button" onClick={() => setUpdateType(type)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${updateType === type ? `${color} shadow-sm transform scale-105` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><span>{icon}</span> {label}</button>
    );
    const badgeMap = { 'NOVICE': { icon: '🌱', label: 'Novice', bg: 'bg-green-100 text-green-700' }, 'APPRENTICE': { icon: '⚒️', label: 'Apprentice', bg: 'bg-blue-100 text-blue-700' }, 'MASTER': { icon: '👑', label: 'Master', bg: 'bg-amber-100 text-amber-700' }, 'SOCIALITE': { icon: '💬', label: 'Socialite', bg: 'bg-purple-100 text-purple-700' } };
    const xpPercent = (profileUser.xp || 0) % 100;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="h-48 md:h-64 bg-gradient-to-r from-slate-800 to-indigo-900 relative overflow-hidden"><div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div></div>
            <main className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-20 md:-mt-24 pb-24 md:pb-12">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-white shadow-lg">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-indigo-50">
                                {profileUser.avatarUrl ? <img src={profileUser.avatarUrl} alt="Profile" className="w-full h-full object-cover"/> : <span className="text-4xl font-bold text-indigo-300">{profileUser.username?.charAt(0).toUpperCase()}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left mt-2 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                            <div><h1 className="text-3xl font-extrabold text-slate-900">{profileUser.username}</h1><p className="text-slate-500 font-medium mt-1">{profileUser.bio || "No bio yet."}</p></div>
                            {isOwner ? (<button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Edit Profile</button>) : (<button onClick={handleFollowToggle} disabled={loadingFollow} className={`px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${isFollowing ? 'bg-white border-2 border-slate-200 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{loadingFollow ? '...' : (isFollowing ? 'Following' : 'Follow')}</button>)}
                        </div>
                        <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Level {profileUser.level || 1}</span><span className="text-xs text-slate-400 font-semibold">({profileUser.xp || 0} XP)</span></div>
                                <span className="text-xs font-bold text-indigo-600">{xpPercent}/100 XP to Lvl {(profileUser.level || 1) + 1}</span>
                            </div>
                            <div className="h-3 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${xpPercent}%` }}></div></div>
                            {profileUser.badges && profileUser.badges.length > 0 && (<div className="flex gap-2 mt-4 flex-wrap">{profileUser.badges.map(b => (<span key={b} className={`px-2 py-1 rounded-md text-xs font-bold border ${badgeMap[b]?.bg || 'bg-gray-100'} flex items-center gap-1`}>{badgeMap[b]?.icon} {badgeMap[b]?.label || b}</span>))}</div>)}
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 border-t border-slate-100 pt-6">
                            {[{ label: 'Followers', val: stats.followers }, { label: 'Following', val: stats.following }, { label: 'Posts', val: stats.totalPosts }, { label: 'Likes', val: stats.totalLikes }, { label: 'Plans', val: stats.totalPlans }, { label: 'Steps Done', val: stats.totalStepsCompleted, highlight: true }].map((stat, idx) => (<div key={idx} className="text-center p-2 rounded-lg hover:bg-slate-50 transition-colors"><div className={`text-xl md:text-2xl font-black ${stat.highlight ? 'text-indigo-600' : 'text-slate-800'}`}>{stat.val}</div><div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div></div>))}
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    {['posts', 'plans', 'progress', 'portfolio'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[100px] py-3 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>))}
                </div>
                <div className="mt-8 animate-in fade-in duration-300">
                    {activeTab === 'posts' && (<div className="space-y-6">{posts.length === 0 && !loadingPosts ? <EmptyState msg="No posts shared yet." /> : posts.map((post, idx) => { const card = (<PostCard key={post.id} post={post} onOpenVideo={() => setShortsIndex(idx)} />); if(posts.length === idx + 1) return <div ref={lastPostRef} key={post.id}>{card}</div>; return card; })}{loadingPosts && <div className="text-center py-4"><LoadingSpinner/></div>}</div>)}
                    {activeTab === 'plans' && (<div>{isOwner && userPlans.length > 0 && (<div className="flex justify-end mb-4"><button onClick={() => navigate('/create-plan')} className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">+ New Roadmap</button></div>)}<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{isOwner && (<div onClick={() => navigate('/create-plan')} className="border-2 border-dashed border-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group min-h-[200px]"><div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><span className="text-2xl font-bold">+</span></div><h3 className="font-bold text-slate-800">Create New Roadmap</h3><p className="text-sm text-slate-500 mt-1">Share your knowledge path</p></div>)}{userPlans.map(plan => <PlanCard key={plan.id} plan={plan} isOwner={isOwner} onDelete={handleDeletePlan} />)}{!isOwner && userPlans.length === 0 && <EmptyState msg="No active roadmaps." />}</div></div>)}
                    {activeTab === 'progress' && (<div className="space-y-6">{isOwner && (<div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"><form onSubmit={handlePostUpdate} className="flex flex-col gap-4"><textarea placeholder="What did you learn today?" className="w-full bg-slate-50 border-transparent rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" rows="2" value={newUpdate} onChange={e => setNewUpdate(e.target.value)} /><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2 flex-wrap"><TypeButton type="LEARNING" icon="💡" label="Learned" color="bg-blue-100 text-blue-700 ring-2 ring-blue-500/20" /><TypeButton type="MILESTONE" icon="🏆" label="Milestone" color="bg-amber-100 text-amber-700 ring-2 ring-amber-500/20" /><TypeButton type="BLOCKER" icon="🚧" label="Blocker" color="bg-red-100 text-red-700 ring-2 ring-red-500/20" /><TypeButton type="RESOURCE" icon="📚" label="Resource" color="bg-purple-100 text-purple-700 ring-2 ring-purple-500/20" /></div><button disabled={submittingUpdate || !newUpdate.trim()} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm shadow-lg">{submittingUpdate ? 'Posting...' : 'Post Update'}</button></div></form></div>)}{progressUpdates.length === 0 ? <EmptyState msg="No progress updates yet." /> : progressUpdates.map(u => <ProgressCard key={u.id} update={u} />)}</div>)}
                    {activeTab === 'portfolio' && (<div className="space-y-6"><div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"><div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold">💼 Experience</h3>{isOwner && <button onClick={() => setModalType('experience')} className="text-indigo-600 font-bold hover:bg-indigo-50 px-3 py-1 rounded-lg">+ Add</button>}</div><div className="space-y-6">{portfolio.experience.length === 0 ? <p className="text-slate-400 italic text-sm">No experience added.</p> : portfolio.experience.map(exp => (<div key={exp.id} className="relative pl-6 border-l-2 border-slate-100 group">{isOwner && <button onClick={() => handleDeleteItem('experience', exp.id)} className="absolute right-0 top-0 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100">✕</button>}<h4 className="font-bold text-slate-800">{exp.title}</h4><p className="text-slate-500 text-sm">{exp.company} • {exp.years}</p></div>))}</div></div></div>)}
                </div>
            </main>
            {shortsIndex !== null && (<ShortsViewer posts={posts} startIndex={shortsIndex} onClose={() => setShortsIndex(null)} onUpdatePost={handleUpdatePost} />)}
            {isEditing && <EditProfileModal user={profileUser} onClose={() => setIsEditing(false)} onUpdate={(u) => setProfileUser(u)} />}
            {modalType && <AddPortfolioModal userId={currentUser.id} type={modalType} onClose={() => setModalType(null)} onSuccess={refreshPortfolio} />}
        </div>
    );
};

const EmptyState = ({ msg }) => (<div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300"><div className="text-4xl mb-3 opacity-30">📂</div><p className="text-slate-400 font-medium">{msg}</p></div>);

export default Profile;