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
    const [activeTab, setActiveTab] = useState('global');
    const { user } = useAuth();

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'following' ? '/posts/feed' : '/posts';
            const response = await api.get(endpoint);
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
            await api.post('/posts', { description: newPost, imageUrl: null });
            setNewPost('');
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
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <LoadingSpinner variant="page" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Navbar />

            <main className="container mx-auto px-4 py-6 max-w-2xl">

                {/* Create Post Section - Glassy Card */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6 mb-8 transition-all hover:shadow-2xl hover:bg-white/90">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] shadow-md flex-shrink-0">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-lg">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <form onSubmit={handleCreatePost} className="flex-1">
                            <textarea
                                className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all resize-none text-slate-700 placeholder-slate-400 shadow-inner"
                                rows="3"
                                placeholder={`What's on your mind, ${user?.username}?`}
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                            />
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-xs font-semibold text-slate-400 tracking-wide">SUPPORTS TEXT & LINKS</div>
                                <button
                                    type="submit"
                                    disabled={isPosting || !newPost.trim()}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center min-w-[120px] ${
                                        isPosting || !newPost.trim()
                                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-indigo-500/30 active:scale-95'
                                    }`}
                                >
                                    {isPosting ? <LoadingSpinner variant="button" /> : 'Share Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Feed Tabs - Sticky Glass Header */}
                <div className="sticky top-[72px] z-10 backdrop-blur-md bg-white/60 rounded-xl border border-white/40 shadow-sm mb-6 flex p-1">
                    {['global', 'following'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
                                activeTab === tab
                                    ? 'bg-white text-indigo-600 shadow-md'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                            }`}
                        >
                            {tab === 'global' ? 'For You' : 'Following'}
                        </button>
                    ))}
                </div>

                {/* Feed Content */}
                {error && (
                    <div className="text-center py-4 bg-red-50/80 backdrop-blur-sm rounded-xl text-red-600 mb-6 border border-red-100 shadow-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-10"><LoadingSpinner /></div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-2xl border border-dashed border-slate-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
                                {activeTab === 'following' ? '👥' : '✨'}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No posts yet</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                {activeTab === 'following'
                                    ? "Follow creators to populate your feed!"
                                    : "Be the first to share something amazing."}
                            </p>
                        </div>
                    ) : (
                        posts.map(post => <PostCard key={post.id} post={post} />)
                    )}
                </div>
            </main>
        </div>
    );
};

export default HomeFeed;