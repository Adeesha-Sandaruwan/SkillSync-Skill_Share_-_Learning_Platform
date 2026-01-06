import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const HomeFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        try {
            await api.post(`/users/${user.id}/posts`, {
                description: newPost,
                mediaUrls: []
            });
            setNewPost('');
            fetchPosts();
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Share your skill...</h2>
                    <form onSubmit={handleCreatePost}>
            <textarea
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="What are you learning today?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
            />
                        <div className="flex justify-end mt-3">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500">Loading feed...</p>
                ) : (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                )}
            </div>
        </div>
    );
};

export default HomeFeed;