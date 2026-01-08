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

    // Data States
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [userPlans, setUserPlans] = useState([]);
    const [progressUpdates, setProgressUpdates] = useState([]);
    const [stats, setStats] = useState({
        totalLikes: 0,
        totalPosts: 0,
        totalPlans: 0,
        totalStepsCompleted: 0, // NEW STAT
        followers: 0,
        following: 0
    });

    // UI States
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);

    // Progress Update Form States
    const [newUpdate, setNewUpdate] = useState('');
    const [updateType, setUpdateType] = useState('LEARNING');
    const [submittingUpdate, setSubmittingUpdate] = useState(false);

    const fetchProfileData = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);

            // 1. Fetch User Basic Info
            const userRes = await api.get(`/users/${userId}`);
            setProfileUser(userRes.data);

            // 2. Fetch Detailed Stats (The one we just fixed)
            try {
                const statsRes = await api.get(`/users/${userId}/stats`);
                setStats(statsRes.data);
            } catch (e) { console.warn("Stats failed", e); }

            // 3. Fetch Content (Independent calls so one failure doesn't break page)
            const fetchContent = async () => {
                try {
                    const postsRes = await api.get(`/posts/user/${userId}`);
                    setPosts(postsRes.data);
                } catch (e) { console.warn("Posts failed", e); }

                try {
                    const plansRes = await api.get(`/users/${userId}/plans`);
                    setUserPlans(plansRes.data);
                } catch (e) { console.warn("Plans failed", e); }

                try {
                    const progressRes = await api.get(`/users/${userId}/progress`);
                    setProgressUpdates(progressRes.data);
                } catch (e) { console.warn("Progress failed", e); }

                // Check Follow Status
                if (currentUser && currentUser.id && String(currentUser.id) !== String(userId)) {
                    try {
                        const followRes = await api.get(`/users/${userId}/is-following?followerId=${currentUser.id}`);
                        setIsFollowing(followRes.data);
                    } catch (e) { console.warn("Follow check failed", e); }
                }
            };

            await fetchContent();

        } catch (error) {
            console.error("Critical: User profile could not be loaded", error);
        } finally {
            setLoading(false);
        }
    }, [userId, currentUser]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleFollowToggle = async () => {
        if (!currentUser) return;
        setLoadingFollow(true);
        try {
            if (isFollowing) {
                await api.post(`/users/${userId}/unfollow?followerId=${currentUser.id}`);
                setIsFollowing(false);
                setStats(p => ({ ...p, followers: Math.max(0, p.followers - 1) }));
            } else {
                await api.post(`/users/${userId}/follow?followerId=${currentUser.id}`);
                setIsFollowing(true);
                setStats(p => ({ ...p, followers: p.followers + 1 }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingFollow(false);
        }
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
            setUpdateType('LEARNING');
        } catch (error) {
            alert("Failed to post update");
        } finally {
            setSubmittingUpdate(false);
        }
    };

    const handleDeletePlan = (id) => {
        setUserPlans(p => p.filter(pl => pl.id !== id));
        setStats(p => ({...p, totalPlans: p.totalPlans - 1}));
    };

    const handleProfileUpdate = (updated) => {
        setProfileUser(updated);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex justify-center h-[60vh] items-center">
                <LoadingSpinner variant="page"/>
            </div>
        </div>
    );

    if (!profileUser) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="text-center pt-20">User not found</div>
        </div>
    );

    const isOwner = currentUser?.id === profileUser.id;

    // Small Helper Component for Update Buttons
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

            {/* Banner Area */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-slate-800 to-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-20 md:-mt-24 pb-12">

                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">

                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-white shadow-lg">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-indigo-50">
                                {profileUser.avatarUrl ? (
                                    <img src={profileUser.avatarUrl} alt="Profile" className="w-full h-full object-cover"/>
                                ) : (
                                    <span className="text-4xl font-bold text-indigo-300">{profileUser.username?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </div>
                        {/* Status Badge (Optional) */}
                        <div className="absolute bottom-2 right-2 bg-emerald-500 w-5 h-5 rounded-full border-4 border-white"></div>
                    </div>

                    {/* User Info & Actions */}
                    <div className="flex-1 text-center md:text-left mt-2 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900">{profileUser.username}</h1>
                                <p className="text-slate-500 font-medium mt-1">{profileUser.bio || "No bio yet."}</p>
                            </div>

                            {isOwner ? (
                                <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={loadingFollow}
                                    className={`px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${isFollowing ? 'bg-white border-2 border-slate-200 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                >
                                    {loadingFollow ? '...' : (isFollowing ? 'Following' : 'Follow')}
                                </button>
                            )}
                        </div>

                        {/* Detailed Stats Grid */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 border-t border-slate-100 pt-6 mt-6">
                            {[
                                { label: 'Followers', val: stats.followers },
                                { label: 'Following', val: stats.following },
                                { label: 'Posts', val: stats.totalPosts },
                                { label: 'Likes', val: stats.totalLikes },
                                { label: 'Plans', val: stats.totalPlans },
                                { label: 'Steps Done', val: stats.totalStepsCompleted, highlight: true } // The new stat
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className={`text-xl md:text-2xl font-black ${stat.highlight ? 'text-indigo-600' : 'text-slate-800'}`}>
                                        {stat.val}
                                    </div>
                                    <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mt-8 flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    {['posts', 'plans', 'progress', 'portfolio'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[100px] py-3 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT AREA */}
                <div className="mt-8 animate-in fade-in duration-300">

                    {/* 1. POSTS TAB */}
                    {activeTab === 'posts' && (
                        <div className="space-y-6">
                            {posts.length === 0 ? <EmptyState msg="No posts shared yet." /> : posts.map(post => <PostCard key={post.id} post={post} />)}
                        </div>
                    )}

                    {/* 2. PLANS TAB */}
                    {activeTab === 'plans' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userPlans.length === 0 ? <EmptyState msg="No active roadmaps." /> : userPlans.map(plan => <PlanCard key={plan.id} plan={plan} isOwner={isOwner} onDelete={handleDeletePlan} />)}
                        </div>
                    )}

                    {/* 3. PROGRESS TAB */}
                    {activeTab === 'progress' && (
                        <div className="space-y-6">
                            {isOwner && (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <form onSubmit={handlePostUpdate} className="flex flex-col gap-4">
                                        <textarea
                                            placeholder="What did you learn today?"
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
                                            <button disabled={submittingUpdate || !newUpdate.trim()} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm shadow-lg">
                                                {submittingUpdate ? 'Posting...' : 'Post Update'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            {progressUpdates.length === 0 ? <EmptyState msg="No progress updates yet." /> : progressUpdates.map(u => <ProgressCard key={u.id} update={u} />)}
                        </div>
                    )}

                    {/* 4. PORTFOLIO TAB (NEW) */}
                    {activeTab === 'portfolio' && (
                        <div className="space-y-6">
                            {/* Experience Section */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg text-lg">💼</span> Experience
                                    </h3>
                                    {isOwner && <button className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">+ Add</button>}
                                </div>
                                <div className="space-y-8 pl-2">
                                    {/* Mock Data Item */}
                                    <div className="relative pl-8 border-l-2 border-slate-100 last:border-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                                        <h4 className="font-bold text-slate-800 text-lg">Senior Developer</h4>
                                        <p className="text-slate-500 font-medium">Tech Corp Inc. • 2022 - Present</p>
                                        <p className="text-slate-600 mt-2 text-sm leading-relaxed">Leading the frontend migration to React and managing a team of 4 junior developers.</p>
                                    </div>
                                    <div className="relative pl-8 border-l-2 border-slate-100">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                                        <h4 className="font-bold text-slate-800 text-lg">Junior Engineer</h4>
                                        <p className="text-slate-500 font-medium">StartupX • 2020 - 2022</p>
                                        <p className="text-slate-600 mt-2 text-sm leading-relaxed">Built the initial MVP using Java Spring Boot.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Certificates Section */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <span className="p-1.5 bg-amber-100 text-amber-600 rounded-lg text-lg">📜</span> Certificates
                                        </h3>
                                        {isOwner && <button className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">+ Add</button>}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all bg-slate-50/50">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">🎓</div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">AWS Certified Architect</h4>
                                                <p className="text-xs text-slate-500">Amazon Web Services • 2024</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills Section */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-lg">⚡</span> Skills
                                        </h3>
                                        {isOwner && <button className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">+ Add</button>}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {["Java", "Spring Boot", "React", "Tailwind", "System Design", "Microservices"].map(skill => (
                                            <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {isEditing && <EditProfileModal user={profileUser} onClose={() => setIsEditing(false)} onUpdate={handleProfileUpdate} />}
        </div>
    );
};

// Helper for empty states
const EmptyState = ({ msg }) => (
    <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300">
        <p className="text-slate-400 font-medium">{msg}</p>
    </div>
);

export default Profile;