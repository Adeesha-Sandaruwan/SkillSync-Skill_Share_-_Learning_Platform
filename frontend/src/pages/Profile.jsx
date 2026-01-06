import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import PlanCard from '../components/PlanCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EditProfileModal from '../components/EditProfileModal'; // <--- Import Modal
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();

    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [userPlans, setUserPlans] = useState([]);
    const [stats, setStats] = useState({ totalLikes: 0, totalPosts: 0, totalPlans: 0 });
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // <--- State for Modal

    useEffect(() => {
        fetchProfileData();
    }, [userId]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [userRes, postsRes, plansRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/users/${userId}/posts`),
                api.get(`/users/${userId}/plans`)
            ]);

            setProfileUser(userRes.data);
            setPosts(postsRes.data);
            setUserPlans(plansRes.data);

            const likes = postsRes.data.reduce((acc, post) => acc + (post.likeCount || 0), 0);
            setStats({
                totalLikes: likes,
                totalPosts: postsRes.data.length,
                totalPlans: plansRes.data.length
            });

        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlan = (planId) => {
        setUserPlans(prev => prev.filter(p => p.id !== planId));
        setStats(prev => ({ ...prev, totalPlans: prev.totalPlans - 1 }));
    };

    const handleProfileUpdate = (updatedUser) => {
        setProfileUser(updatedUser); // Update UI immediately
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <LoadingSpinner variant="page" />
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-700">User not found</h2>
                </div>
            </div>
        );
    }

    const isOwner = currentUser?.id === profileUser.id;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section / Profile Header */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

                        {/* Avatar */}
                        <div className="relative">
                            {profileUser.avatarUrl ? (
                                <img
                                    src={profileUser.avatarUrl}
                                    alt="Profile"
                                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg ring-4 ring-white"
                                />
                            ) : (
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                                    {profileUser.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full" title="Online"></div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left pt-2">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                {profileUser.username}
                            </h1>
                            {profileUser.bio && (
                                <p className="text-gray-600 mt-1 max-w-lg">{profileUser.bio}</p>
                            )}
                            <p className="text-gray-400 text-sm font-medium mt-1">{profileUser.email}</p>

                            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-8">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{stats.totalPosts}</div>
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills Shared</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{stats.totalLikes}</div>
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Likes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{stats.totalPlans}</div>
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Plans Active</div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button (Only visible if own profile) */}
                        {isOwner && (
                            <button
                                onClick={() => setIsEditing(true)} // <--- Open Modal
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="mt-10 border-b border-gray-200 flex space-x-8">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`pb-4 px-1 text-sm font-medium transition-all relative ${
                                activeTab === 'posts'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Skill Posts
                        </button>
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`pb-4 px-1 text-sm font-medium transition-all relative ${
                                activeTab === 'plans'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Learning Plans
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                {activeTab === 'posts' ? (
                    <div className="space-y-6">
                        {posts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                                <span className="text-4xl block mb-2">📭</span>
                                <p className="text-gray-500 text-lg">No posts shared yet.</p>
                            </div>
                        ) : (
                            posts.map(post => <PostCard key={post.id} post={post} />)
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userPlans.length === 0 ? (
                            <div className="col-span-2 text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                                <span className="text-4xl block mb-2">🎓</span>
                                <p className="text-gray-500 text-lg">No active learning plans.</p>
                            </div>
                        ) : (
                            userPlans.map(plan => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    isOwner={isOwner}
                                    onDelete={handleDeletePlan}
                                />
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Edit Profile Modal */}
            {isEditing && (
                <EditProfileModal
                    user={profileUser}
                    onClose={() => setIsEditing(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default Profile;