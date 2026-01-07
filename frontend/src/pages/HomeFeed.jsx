import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';

const HomeFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [error, setError] = useState(null);

    // NEW: Tab State ('global' or 'following')
    const [activeTab, setActiveTab] = useState('global');

    const { user } = useAuth();

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'following') {
                // Fetch only posts from people I follow
                response = await api.get('/posts/feed');
            } else {
                // Fetch everything (Global Discovery)
                response = await api.get('/posts');
            }
            setPosts(response.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to load feed. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        setIsPosting(true);
        try {
            await api.post('/posts', {
                description: newPost,
                imageUrl: null
            });
            setNewPost('');
            // If we are on 'following' tab, switching to 'global' might be better
            // to see our own new post immediately, but refreshing is fine.
            fetchPosts();
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to post. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    if (loading && posts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <LoadingSpinner variant="page" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-2xl">

                {/* Create Post Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 transition-shadow hover:shadow-md">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-blue-600 font-bold text-lg">{user?.username?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <form onSubmit={handleCreatePost} className="flex-1">
                            <textarea
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-gray-700 placeholder-gray-400"
                                rows="3"
                                placeholder={`What's on your mind, ${user?.username}?`}
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                            />
                            <div className="flex justify-between items-center mt-3">
                                <div className="text-xs text-gray-400 font-medium">Supports text & links</div>
                                <button
                                    type="submit"
                                    disabled={isPosting || !newPost.trim()}
                                    className={`px-6 py-2 rounded-lg font-medium text-sm text-white transition-all shadow-sm flex items-center justify-center min-w-[100px] ${
                                        isPosting || !newPost.trim()
                                            ? 'bg-blue-300 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
                                    }`}
                                >
                                    {isPosting ? <LoadingSpinner variant="button" /> : 'Share Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* NEW: Feed Tabs */}
                <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 shadow-sm">
                    <button
                        onClick={() => setActiveTab('global')}
                        className={`flex-1 py-4 text-sm font-bold text-center transition-all relative ${
                            activeTab === 'global' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        For You
                        {activeTab === 'global' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-4 text-sm font-bold text-center transition-all relative ${
                            activeTab === 'following' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Following
                        {activeTab === 'following' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
                    </button>
                </div>

                {/* Feed Content */}
                {error && (
                    <div className="text-center py-8 bg-red-50 rounded-lg text-red-600 mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-10"><LoadingSpinner /></div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            {activeTab === 'following' ? '👥' : '✨'}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No posts yet</h3>
                        <p className="text-gray-500">
                            {activeTab === 'following'
                                ? "Follow some creators to see their posts here!"
                                : "Be the first to share something with the community."}
                        </p>
                    </div>
                ) : (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                )}
            </main>
        </div>
    );
};

export default HomeFeed;