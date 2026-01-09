import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import ShortsViewer from '../components/ShortsViewer'; // <--- NEW IMPORT
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';

const HomeFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [newPost, setNewPost] = useState('');

    // LIGHTBOX / SHORTS STATE
    const [viewerStartIndex, setViewerStartIndex] = useState(null); // If not null, viewer is open

    // FILE UPLOAD STATE
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('global');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const { user } = useAuth();

    // ... (Keep existing fetchPosts and createPost logic exactly as is) ...
    // ... I will abbreviate standard logic to focus on the fix ...

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
            setError("Failed to load feed.");
        } finally {
            setLoading(false);
        }
    }, [activeTab, page, user?.id]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const lastPostRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // ... (Keep handleCreatePost, handleFileSelect, etc. exactly as is) ...
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 3) { alert("Max 3 files."); return; }
        const newFiles = [];
        const newPreviews = [];
        for (const file of files) {
            newFiles.push(file);
            newPreviews.push({ url: URL.createObjectURL(file), type: file.type });
        }
        setSelectedFiles([...selectedFiles, ...newFiles]);
        setPreviews([...previews, ...newPreviews]);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim() && selectedFiles.length === 0) return;
        setIsPosting(true);
        try {
            const formData = new FormData();
            formData.append('description', newPost);
            selectedFiles.forEach(file => formData.append('media', file));
            const res = await api.post(`/posts?userId=${user.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setPosts(prev => [res.data, ...prev]);
            setNewPost(''); setSelectedFiles([]); setPreviews([]);
        } catch (e) { alert("Failed to post"); } finally { setIsPosting(false); }
    };

    // --- NEW: LIGHTBOX HANDLER ---
    const openShortsViewer = (postIndex) => {
        setViewerStartIndex(postIndex);
        document.body.style.overflow = 'hidden';
    };

    const closeShortsViewer = () => {
        setViewerStartIndex(null);
        document.body.style.overflow = 'auto';
    };

    const handleUpdatePost = (postId, updatedData) => {
        // Optimistic update of the background list when interaction happens in viewer
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updatedData } : p));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Navbar />

            {/* SHORTS VIEWER OVERLAY */}
            {viewerStartIndex !== null && (
                <ShortsViewer
                    posts={posts}
                    startIndex={viewerStartIndex}
                    onClose={closeShortsViewer}
                    onUpdatePost={handleUpdatePost}
                />
            )}

            <main className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Create Post UI (Keep existing) */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
                    {/* ... (Same Create Post Form Code as before) ... */}
                    <form onSubmit={handleCreatePost} className="flex-1">
                        <textarea className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl" rows="3" placeholder={`What's on your mind?`} value={newPost} onChange={(e) => setNewPost(e.target.value)} />
                        {previews.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{previews.map((p,i) => <img key={i} src={p.url} className="aspect-square object-cover rounded-xl" />)}</div>}
                        <div className="flex justify-between items-center mt-4">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase">Media</button>
                            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
                            <button type="submit" disabled={isPosting} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">{isPosting ? '...' : 'Post'}</button>
                        </div>
                    </form>
                </div>

                {/* POST LIST */}
                <div className="space-y-6 pb-10">
                    {posts.map((post, index) => (
                        <div key={post.id} ref={index === posts.length - 1 ? lastPostRef : null}>
                            <PostCard
                                post={post}
                                onOpenViewer={() => openShortsViewer(index)} // <--- Pass Index to open viewer
                            />
                        </div>
                    ))}
                    {loading && <div className="flex justify-center py-6"><LoadingSpinner /></div>}
                </div>
            </main>
        </div>
    );
};

export default HomeFeed;