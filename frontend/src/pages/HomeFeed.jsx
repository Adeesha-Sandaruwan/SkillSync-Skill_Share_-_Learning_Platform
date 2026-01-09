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

    // MULTI-MEDIA STATE
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('global');
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

    // --- FILE HANDLING WITH VALIDATION ---
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 3) {
            alert("Maximum 3 media files allowed.");
            return;
        }

        const newFiles = [];
        const newPreviews = [];

        for (const file of files) {
            // Check Video Duration
            if (file.type.startsWith('video/')) {
                const duration = await getVideoDuration(file);
                if (duration > 30) {
                    alert(`Video "${file.name}" is too long. Max 30 seconds.`);
                    continue; // Skip this file
                }
            }
            newFiles.push(file);
            newPreviews.push({ url: URL.createObjectURL(file), type: file.type });
        }

        setSelectedFiles([...selectedFiles, ...newFiles]);
        setPreviews([...previews, ...newPreviews]);
    };

    const getVideoDuration = (file) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const removeFile = (index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        setPreviews(updatedPreviews);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim() && selectedFiles.length === 0) return;

        setIsPosting(true);
        try {
            const formData = new FormData();
            formData.append('description', newPost);

            // Append multiple files with the name 'media'
            selectedFiles.forEach(file => {
                formData.append('media', file);
            });

            const res = await api.post(`/posts?userId=${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setPosts(prev => [res.data, ...prev]);
            setNewPost('');
            setSelectedFiles([]);
            setPreviews([]);
            if(fileInputRef.current) fileInputRef.current.value = '';
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

                            {/* PREVIEWS GRID */}
                            {previews.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {previews.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                                            {preview.type.startsWith('video') ? (
                                                <video src={preview.url} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={preview.url} alt="preview" className="w-full h-full object-cover" />
                                            )}
                                            <button type="button" onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={handleFileSelect}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Media (Max 3)
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPosting || (!newPost.trim() && selectedFiles.length === 0)}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center min-w-[120px] ${
                                        isPosting || (!newPost.trim() && selectedFiles.length === 0)
                                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                    }`}
                                >
                                    {isPosting ? <LoadingSpinner variant="button" /> : 'Share Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="sticky top-[72px] z-10 backdrop-blur-md bg-white/60 rounded-xl border border-white/40 shadow-sm mb-6 flex p-1">
                    {['global', 'following'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
                                activeTab === tab ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                            }`}
                        >
                            {tab === 'global' ? 'For You' : 'Following'}
                        </button>
                    ))}
                </div>

                {error && <div className="text-center py-4 bg-red-50 text-red-600 mb-6 rounded-xl">{error}</div>}

                <div className="space-y-6 pb-10">
                    {posts.map((post, index) => {
                        if (posts.length === index + 1) return <div ref={lastPostRef} key={post.id}><PostCard post={post} /></div>;
                        return <PostCard key={post.id} post={post} />;
                    })}
                    {loading && <div className="flex justify-center py-6"><LoadingSpinner /></div>}
                </div>
            </main>
        </div>
    );
};

export default HomeFeed;