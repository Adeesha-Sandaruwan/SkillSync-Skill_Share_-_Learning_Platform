import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const HomeFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [error, setError] = useState(null);

    const { user } = useAuth();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to load feed. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        setIsPosting(true);
        try {
            await api.post(`/users/${user.id}/posts`, {
                description: newPost,
                mediaUrls: [] // Future: Add image upload logic here
            });
            setNewPost('');
            await fetchPosts(); // Refresh feed
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to post. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Create Post Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 transition-shadow hover:shadow-md">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {user?.username?.charAt(0).toUpperCase()}
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
                                <div className="text-xs text-gray-400 font-medium">
                                    {/* Future: Add icons for image/video upload here */}
                                    Supports text & links
                                </div>
                                <button
                                    type="submit"
                                    disabled={isPosting || !newPost.trim()}
                                    className={`px-6 py-2 rounded-lg font-medium text-sm text-white transition-all shadow-sm ${
                                        isPosting || !newPost.trim()
                                            ? 'bg-blue-300 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
                                    }`}
                                >
                                    {isPosting ? 'Posting...' : 'Share Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Feed Section */}
                {error && (
                    <div className="text-center py-8 bg-red-50 rounded-lg text-red-600 mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-48 animate-pulse">
                                <div className="flex space-x-4">
                                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">No posts yet. Be the first to share!</p>
                    </div>
                ) : (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                )}
            </main>
        </div>
    );
};

export default HomeFeed;