import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom'; // <--- Added Link import
import api from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import ShortsViewer from '../components/ShortsViewer';
import LoadingSpinner from '../components/LoadingSpinner';
import SuggestionSidebar from '../components/SuggestionSidebar'; // <--- Added Sidebar import
import { useAuth } from '../context/useAuth';

const HomeFeed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [newPost, setNewPost] = useState('');

    // LIGHTBOX / SHORTS STATE
    const [isShortsOpen, setIsShortsOpen] = useState(false);
    const [initialShortsId, setInitialShortsId] = useState(null);

    // FILE UPLOAD STATE
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('global');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    // Helper: Strict Video Check
    const isVideoUrl = (url) => {
        if (!url) return false;
        const lower = url.toLowerCase();
        return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
    };

    const hasVideo = (post) => {
        const p = post.originalPost || post;
        const media = p.mediaUrls && p.mediaUrls.length > 0 ? p.mediaUrls : (p.imageUrl ? [p.imageUrl] : []);
        return media.some(url => isVideoUrl(url));
    };

    const videoPosts = posts.filter(p => hasVideo(p));

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
        } catch (error) {
            console.error("Error fetching posts:", error);
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
            if(fileInputRef.current) fileInputRef.current.value = '';
        } catch (e) { alert("Failed to post"); } finally { setIsPosting(false); }
    };

    const handleDeletePost = (postId) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    const openShortsViewer = (postId) => {
        if (videoPosts.some(p => p.id === postId)) {
            setInitialShortsId(postId);
            setIsShortsOpen(true);
            document.body.style.overflow = 'hidden';
        }
    };

    const closeShortsViewer = () => {
        setIsShortsOpen(false);
        setInitialShortsId(null);
        document.body.style.overflow = 'auto';
    };

    const handleUpdatePost = (postId, updatedData) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updatedData } : p));
    };

    const shortsStartIndex = videoPosts.findIndex(p => p.id === initialShortsId);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {isShortsOpen && shortsStartIndex !== -1 && (
                <ShortsViewer
                    posts={videoPosts}
                    startIndex={shortsStartIndex}
                    onClose={closeShortsViewer}
                    onUpdatePost={handleUpdatePost}
                />
            )}

            <main className="container mx-auto px-4 py-6 max-w-7xl">
                {/* --- 3-COLUMN HOLY GRAIL LAYOUT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* 1. LEFT COLUMN: Mini Profile & Links (Hidden on mobile) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Mini Profile Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
                                <div className="relative w-20 h-20 mx-auto mb-3">
                                    <img src={user?.avatarUrl} className="w-full h-full rounded-full object-cover border-2 border-indigo-50" />
                                    <div className="absolute bottom-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                        Lvl {user?.level || 1}
                                    </div>
                                </div>
                                <h2 className="font-bold text-lg text-slate-800">{user?.username}</h2>
                                <p className="text-xs text-slate-500 mb-4 line-clamp-1">{user?.bio || "Ready to learn!"}</p>

                                <Link to={`/profile/${user?.id}`} className="block mt-4 w-full py-2 bg-slate-50 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors">
                                    View Profile
                                </Link>
                            </div>

                            {/* Quick Navigation */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <Link to="/leaderboard" className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50">
                                    <span className="text-xl">🏆</span>
                                    <span className="font-bold text-slate-700 text-sm">Leaderboard</span>
                                </Link>
                                <Link to="/create-plan" className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50">
                                    <span className="text-xl">🗺️</span>
                                    <span className="font-bold text-slate-700 text-sm">Create Roadmap</span>
                                </Link>
                                <Link to="/explore" className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                                    <span className="text-xl">🧭</span>
                                    <span className="font-bold text-slate-700 text-sm">Explore</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 2. CENTER COLUMN: The Feed */}
                    <div className="lg:col-span-2">
                        {/* Create Post UI */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
                            <form onSubmit={handleCreatePost}>
                                <div className="flex gap-3">
                                    <img src={user?.avatarUrl} className="w-10 h-10 rounded-full object-cover hidden sm:block" />
                                    <div className="flex-1">
                                        <textarea className="w-full p-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none text-sm" rows="2" placeholder={`What are you learning today, ${user?.firstname || 'friend'}?`} value={newPost} onChange={(e) => setNewPost(e.target.value)} />

                                        {/* Image Previews */}
                                        {previews.length > 0 && (
                                            <div className="mt-3 grid grid-cols-3 gap-2">
                                                {previews.map((p,i) => (
                                                    <div key={i} className="relative group">
                                                        <img src={p.url} className="aspect-square object-cover rounded-lg border border-slate-200" />
                                                        <button type="button" onClick={() => { setPreviews(previews.filter((_, idx) => idx !== i)); setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i)); }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500">✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"><span>📷</span> Media</button>
                                            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" onChange={handleFileSelect} />
                                            <button type="submit" disabled={isPosting || (!newPost.trim() && selectedFiles.length === 0)} className="bg-indigo-600 text-white px-6 py-1.5 rounded-lg font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200">{isPosting ? 'Posting...' : 'Post'}</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Feed Tabs */}
                        <div className="flex border-b border-slate-200 mb-6 sticky top-16 bg-slate-50/95 backdrop-blur z-30 pt-2">
                            <button onClick={() => setActiveTab('global')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'global' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>For You</button>
                            <button onClick={() => setActiveTab('following')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'following' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Following</button>
                        </div>

                        {/* Posts List */}
                        <div className="space-y-6 pb-20">
                            {posts.map((post, index) => (
                                <div key={post.id} ref={index === posts.length - 1 ? lastPostRef : null}>
                                    <PostCard
                                        post={post}
                                        onOpenVideo={() => hasVideo(post) && openShortsViewer(post.id)}
                                        onDeleteSuccess={() => handleDeletePost(post.id)}
                                    />
                                </div>
                            ))}
                            {loading && <div className="flex justify-center py-6"><LoadingSpinner /></div>}
                        </div>
                    </div>

                    {/* 3. RIGHT COLUMN: Suggestions */}
                    <div className="hidden lg:block lg:col-span-1">
                        <SuggestionSidebar />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomeFeed;