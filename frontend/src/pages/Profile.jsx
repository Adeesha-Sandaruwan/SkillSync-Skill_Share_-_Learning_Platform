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

    // Stats State
    const [stats, setStats] = useState({ totalLikes: 0, totalPosts: 0, totalPlans: 0, followers: 0, following: 0 });
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Follow State
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);

    // Update State
    const [newUpdate, setNewUpdate] = useState('');
    const [submittingUpdate, setSubmittingUpdate] = useState(false);

    const fetchProfileData = useCallback(async () => {
        try {
            setLoading(true);
            const [userRes, postsRes, plansRes, progressRes, followRes, statsRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/posts/user/${userId}`),
                api.get(`/users/${userId}/plans`),
                api.get(`/users/${userId}/progress`),
                // Check if I am following this user
                api.get(`/users/${userId}/is-following?followerId=${currentUser.id}`),
                // Get Follow Stats
                api.get(`/users/${userId}/stats`)
            ]);

            setProfileUser(userRes.data);
            setPosts(postsRes.data);
            setUserPlans(plansRes.data);
            setProgressUpdates(progressRes.data);
            setIsFollowing(followRes.data);

            // CALCULATE TOTAL LIKES
            // We use the new 'likeCount' field from the Backend SkillPost entity
            const likes = postsRes.data.reduce((acc, post) => acc + (post.likedUserIds?.length || 0), 0);

            setStats({
                totalLikes: likes,
                totalPosts: postsRes.data.length,
                totalPlans: plansRes.data.length,
                followers: statsRes.data.followers,
                following: statsRes.data.following
            });

        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser.id, userId]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleFollowToggle = async () => {
        setLoadingFollow(true);
        try {
            if (isFollowing) {
                await api.post(`/users/${userId}/unfollow?followerId=${currentUser.id}`);
                setIsFollowing(false);
                setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
            } else {
                await api.post(`/users/${userId}/follow?followerId=${currentUser.id}`);
                setIsFollowing(true);
                setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
            }
        } catch (error) {
            console.error("Follow action failed", error);
        } finally {
            setLoadingFollow(false);
        }
    };

    const handlePostUpdate = async (e) => {
        e.preventDefault();
        if (!newUpdate.trim()) return;

        setSubmittingUpdate(true);
        try {
            const response = await api.post(`/users/${currentUser.id}/progress`, { content: newUpdate });
            setProgressUpdates([response.data, ...progressUpdates]);
            setNewUpdate('');
        } catch (error) {
            console.error(error);
            alert("Failed to post update");
        } finally {
            setSubmittingUpdate(false);
        }
    };

    const handleDeletePlan = (planId) => {
        setUserPlans(prev => prev.filter(p => p.id !== planId));
        setStats(prev => ({ ...prev, totalPlans: prev.totalPlans - 1 }));
    };

    const handleProfileUpdate = (updatedUser) => {
        setProfileUser(updatedUser);
    };

    if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex justify-center h-[60vh] items-center"><LoadingSpinner variant="page"/></div></div>;
    if (!profileUser) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="text-center py-20">User not found</div></div>;

    const isOwner = currentUser?.id === profileUser.id;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative">
                            {profileUser.avatarUrl ? (
                                <img src={profileUser.avatarUrl} alt="Profile" className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg ring-4 ring-white"/>
                            ) : (
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">{profileUser.username.charAt(0).toUpperCase()}</div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left pt-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profileUser.username}</h1>

                                {/* Action Buttons */}
                                {!isOwner && (
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={loadingFollow}
                                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all transform active:scale-95 ${
                                            isFollowing
                                                ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-red-200 hover:text-red-600'
                                                : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700'
                                        }`}
                                    >
                                        {loadingFollow ? '...' : (isFollowing ? 'Following' : 'Follow')}
                                    </button>
                                )}
                                {isOwner && (
                                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {profileUser.bio && <p className="text-gray-600 mt-1 max-w-lg">{profileUser.bio}</p>}

                            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-8">
                                <div className="text-center"><div className="text-2xl font-bold text-gray-900">{stats.followers}</div><div className="text-xs font-semibold text-gray-500 uppercase">Followers</div></div>
                                <div className="text-center"><div className="text-2xl font-bold text-gray-900">{stats.following}</div><div className="text-xs font-semibold text-gray-500 uppercase">Following</div></div>
                                <div className="text-center"><div className="text-2xl font-bold text-gray-900">{stats.totalPosts}</div><div className="text-xs font-semibold text-gray-500 uppercase">Skills</div></div>
                                <div className="text-center"><div className="text-2xl font-bold text-gray-900">{stats.totalLikes}</div><div className="text-xs font-semibold text-gray-500 uppercase">Likes</div></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 border-b border-gray-200 flex space-x-8">
                        {['posts', 'plans', 'progress'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 px-1 text-sm font-medium capitalize transition-all ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab === 'posts' ? 'Skill Posts' : tab === 'plans' ? 'Learning Plans' : 'Timeline Updates'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 py-8">

                {/* POSTS TAB */}
                {activeTab === 'posts' && (
                    <div className="space-y-6">
                        {posts.length === 0 ? <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">No posts shared yet.</div> : posts.map(post => <PostCard key={post.id} post={post} />)}
                    </div>
                )}

                {/* PLANS TAB */}
                {activeTab === 'plans' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userPlans.length === 0 ? <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">No active learning plans.</div> : userPlans.map(plan => <PlanCard key={plan.id} plan={plan} isOwner={isOwner} onDelete={handleDeletePlan} />)}
                    </div>
                )}

                {/* PROGRESS TAB */}
                {activeTab === 'progress' && (
                    <div className="space-y-6">
                        {isOwner && (
                            <form onSubmit={handlePostUpdate} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                                <input
                                    type="text"
                                    placeholder="What did you achieve today?"
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newUpdate}
                                    onChange={(e) => setNewUpdate(e.target.value)}
                                />
                                <button disabled={submittingUpdate || !newUpdate.trim()} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50">
                                    {submittingUpdate ? '...' : 'Post Update'}
                                </button>
                            </form>
                        )}
                        {progressUpdates.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">No updates yet.</div>
                        ) : (
                            progressUpdates.map(update => <ProgressCard key={update.id} update={update} />)
                        )}
                    </div>
                )}
            </main>

            {isEditing && <EditProfileModal user={profileUser} onClose={() => setIsEditing(false)} onUpdate={handleProfileUpdate} />}
        </div>
    );
};

export default Profile;