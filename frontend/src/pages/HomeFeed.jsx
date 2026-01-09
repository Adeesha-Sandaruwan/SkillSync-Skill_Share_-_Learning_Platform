import { useEffect, useState, useRef, useCallback } from 'react';
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

    // File Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('global');

    // Pagination
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const { user } = useAuth();

    useEffect(() => {
        setPosts([]);
        setPage(0);
        setHasMore(true);
        setLoading(true);
    }, [activeTab]);

    const fetchPosts = useCallback(async () => {
        if (!hasMore && page > 0) return;
        try {
            setLoading(true);
            const endpoint = activeTab === 'following'
                ? `/posts/feed?userId=${user?.id}&page=${page}&size=10`
                : `/posts?page=${page}&size=10`;

            const response = await api.get(endpoint);
            const newPosts = response.data;

            setPosts(prev => {
                if (page === 0) return newPosts;
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
                return [...prev, ...uniqueNewPosts];
            });
            setHasMore(newPosts.length === 10);
            setError(null);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to load feed. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [activeTab, page, user?.id]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const lastPostRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // --- FILE HANDLING ---
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim() && !selectedFile) return;

        setIsPosting(true);
        try {
            // Using FormData for File Upload
            const formData = new FormData();
            formData.append('description', newPost);
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const res = await api.post(`/posts?userId=${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setPosts(prev => [res.data, ...prev]);
            setNewPost('');
            clearFile();
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to post. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Navbar />
            <main className="container mx-auto px-4 py-6 max-w-2xl">

                {/* CREATE POST CARD */}
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

                            {/* Image Preview */}
                            {previewUrl && (
                                <div className="relative mt-3 rounded-xl overflow-hidden shadow-md max-h-60 border border-slate-200">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center gap-2">
                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    {/* Image Button */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Photo
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPosting || (!newPost.trim() && !selectedFile)}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center min-w-[120px] ${
                                        isPosting || (!newPost.trim() && !selectedFile)
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

                {/* TABS */}
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

                {/* POSTS LIST */}
                {error && <div className="text-center py-4 bg-red-50 text-red-600 mb-6 rounded-xl">{error}</div>}

                <div className="space-y-6 pb-10">
                    {posts.map((post, index) => {
                        if (posts.length === index + 1) return <div ref={lastPostRef} key={post.id}><PostCard post={post} /></div>;
                        return <PostCard key={post.id} post={post} />;
                    })}

                    {loading && <div className="flex justify-center py-6"><LoadingSpinner /></div>}

                    {!loading && posts.length === 0 && (
                        <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-2xl border border-dashed border-slate-300">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No posts yet</h3>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HomeFeed;