import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import PlanCard from '../components/PlanCard';
import ProgressCard from '../components/ProgressCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EditProfileModal from '../components/EditProfileModal';
import { useAuth } from '../context/useAuth';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [userPlans, setUserPlans] = useState([]);
    const [progressUpdates, setProgressUpdates] = useState([]);
    const [stats, setStats] = useState({ totalLikes: 0, totalPosts: 0, totalPlans: 0, followers: 0, following: 0 });
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);

    // UPDATE STATES
    const [newUpdate, setNewUpdate] = useState('');
    const [updateType, setUpdateType] = useState('LEARNING'); // Default
    const [submittingUpdate, setSubmittingUpdate] = useState(false);

    const fetchProfileData = useCallback(async () => {
        try {
            setLoading(true);
            const [userRes, postsRes, plansRes, progressRes, followRes, statsRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/posts/user/${userId}`),
                api.get(`/users/${userId}/plans`),
                api.get(`/users/${userId}/progress`),
                api.get(`/users/${userId}/is-following?followerId=${currentUser.id}`),
                api.get(`/users/${userId}/stats`)
            ]);

            setProfileUser(userRes.data);
            setPosts(postsRes.data);
            setUserPlans(plansRes.data);
            setProgressUpdates(progressRes.data);
            setIsFollowing(followRes.data);

            const likes = postsRes.data.reduce((acc, post) => acc + (post.likedUserIds?.length || 0), 0);
            setStats({
                totalLikes: likes,
                totalPosts: postsRes.data.length,
                totalPlans: plansRes.data.length,
                followers: statsRes.data.followers,
                following: statsRes.data.following
            });
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [currentUser.id, userId]);

    useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

    const handleFollowToggle = async () => {
        setLoadingFollow(true);
        try {
            if (isFollowing) {
                await api.post(`/users/${userId}/unfollow?followerId=${currentUser.id}`);
                setIsFollowing(false);
                setStats(p => ({ ...p, followers: p.followers - 1 }));
            } else {
                await api.post(`/users/${userId}/follow?followerId=${currentUser.id}`);
                setIsFollowing(true);
                setStats(p => ({ ...p, followers: p.followers + 1 }));
            }
        } catch (error) { console.error(error); } finally { setLoadingFollow(false); }
    };

    const handlePostUpdate = async (e) => {
        e.preventDefault();
        if (!newUpdate.trim()) return;
        setSubmittingUpdate(true);
        try {
            const response = await api.post(`/users/${currentUser.id}/progress`, {
                content: newUpdate,
                type: updateType
            });
            setProgressUpdates([response.data, ...progressUpdates]);
            setNewUpdate('');
            setUpdateType('LEARNING'); // Reset
        } catch (error) { alert("Failed to post update"); } finally { setSubmittingUpdate(false); }
    };

    const handleDeletePlan = (id) => { setUserPlans(p => p.filter(pl => pl.id !== id)); setStats(p => ({...p, totalPlans: p.totalPlans - 1})); };
    const handleProfileUpdate = (updated) => { setProfileUser(updated); };

    if (loading) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="flex justify-center h-[60vh] items-center"><LoadingSpinner variant="page"/></div></div>;
    if (!profileUser) return <div>User not found</div>;

    const isOwner = currentUser?.id === profileUser.id;

    // Helper to render type selector buttons
    const TypeButton = ({ type, icon, label, color }) => (
        <button
            type="button"
            onClick={() => setUpdateType(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                updateType === type
                    ? `${color} shadow-sm transform scale-105`
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
        >
            <span>{icon}</span> {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Banner */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-20 md:-mt-24 pb-12">

                {/* Profile Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">

                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-white shadow-xl">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-4 border-indigo-50">
                                {profileUser.avatarUrl ? (
                                    <img src={profileUser.avatarUrl} alt="Profile" className="w-full h-full object-cover"/>
                                ) : (
                                    <span className="text-4xl font-bold text-indigo-300">{profileUser.username.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left mt-2 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900">{profileUser.username}</h1>
                                {profileUser.bio && <p className="text-slate-500 font-medium mt-1">{profileUser.bio}</p>}
                            </div>

                            {isOwner ? (
                                <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Edit Profile</button>
                            ) : (
                                <button onClick={handleFollowToggle} disabled={loadingFollow} className={`px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${isFollowing ? 'bg-white border-2 border-slate-200 text-slate-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}`}>
                                    {loadingFollow ? '...' : (isFollowing ? 'Following' : 'Follow')}
                                </button>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-2 md:gap-8 border-t border-slate-100 pt-6">
                            {[
                                { label: 'Followers', val: stats.followers },
                                { label: 'Following', val: stats.following },
                                { label: 'Posts', val: stats.totalPosts },
                                { label: 'Likes', val: stats.totalLikes }
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="text-xl md:text-2xl font-black text-slate-800">{stat.val}</div>
                                    <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-8 flex p-1 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm max-w-lg mx-auto md:mx-0">
                    {['posts', 'plans', 'progress'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="mt-8">
                    {activeTab === 'posts' && (
                        <div className="space-y-6">
                            {posts.length === 0 ? <EmptyState msg="No posts yet" /> : posts.map(post => <PostCard key={post.id} post={post} />)}
                        </div>
                    )}

                    {activeTab === 'plans' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userPlans.length === 0 ? <EmptyState msg="No active plans" /> : userPlans.map(plan => <PlanCard key={plan.id} plan={plan} isOwner={isOwner} onDelete={handleDeletePlan} />)}
                        </div>
                    )}

                    {activeTab === 'progress' && (
                        <div className="space-y-6">
                            {isOwner && (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <form onSubmit={handlePostUpdate} className="flex flex-col gap-4">
                                        <textarea
                                            placeholder="What's happening on your journey?"
                                            className="w-full bg-slate-50 border-transparent rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                            rows="2"
                                            value={newUpdate}
                                            onChange={e => setNewUpdate(e.target.value)}
                                        />

                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex gap-2 flex-wrap">
                                                <TypeButton type="LEARNING" icon="💡" label="Learned" color="bg-blue-100 text-blue-700 ring-2 ring-blue-500/20" />
                                                <TypeButton type="MILESTONE" icon="🏆" label="Milestone" color="bg-amber-100 text-amber-700 ring-2 ring-amber-500/20" />
                                                <TypeButton type="BLOCKER" icon="🚧" label="Blocker" color="bg-red-100 text-red-700 ring-2 ring-red-500/20" />
                                                <TypeButton type="RESOURCE" icon="📚" label="Resource" color="bg-purple-100 text-purple-700 ring-2 ring-purple-500/20" />
                                            </div>

                                            <button
                                                disabled={submittingUpdate || !newUpdate.trim()}
                                                className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm shadow-lg"
                                            >
                                                {submittingUpdate ? '...' : 'Post Update'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {progressUpdates.length === 0 ? <EmptyState msg="No updates yet" /> : progressUpdates.map(u => <ProgressCard key={u.id} update={u} />)}
                        </div>
                    )}
                </div>
            </main>
            {isEditing && <EditProfileModal user={profileUser} onClose={() => setIsEditing(false)} onUpdate={handleProfileUpdate} />}
        </div>
    );
};

const EmptyState = ({ msg }) => (
    <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300">
        <p className="text-slate-400 font-medium">{msg}</p>
    </div>
);

export default Profile;