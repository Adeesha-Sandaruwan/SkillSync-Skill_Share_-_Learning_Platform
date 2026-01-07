import { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Like States
    const [liked, setLiked] = useState(post.likedUserIds?.includes(user?.id) || false);
    const [likeCount, setLikeCount] = useState(post.likedUserIds?.length || 0);

    // Animation States
    const [showBigHeart, setShowBigHeart] = useState(false);
    const [animateSmallHeart, setAnimateSmallHeart] = useState(false);

    // Edit/Delete States
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.description);
    const [description, setDescription] = useState(post.description);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isOwner = user?.id === post.user?.id;

    // --- LAG-FREE LIKE LOGIC ---
    const triggerLike = async () => {
        // 1. Haptic Feedback (Mobile Vibration)
        if (navigator.vibrate) navigator.vibrate(50);

        // 2. Trigger Button Animation
        setAnimateSmallHeart(true);
        setTimeout(() => setAnimateSmallHeart(false), 300);

        // 3. INSTANT UI UPDATE (No waiting for server)
        // We use functional updates (prev => ...) to handle rapid clicks correctly
        setLiked(prevLiked => {
            const newLiked = !prevLiked;

            // Update count based on the NEW state
            setLikeCount(prevCount => newLiked ? prevCount + 1 : prevCount - 1);

            return newLiked;
        });

        // 4. Send Request in Background
        try {
            await api.put(`/posts/${post.id}/like`);
        } catch (error) {
            console.error("Like failed, reverting UI");
            // If server fails, revert the UI silently
            setLiked(prev => !prev);
            setLikeCount(prev => liked ? prev + 1 : prev - 1); // 'liked' here refers to state before the failed click
        }
    };

    // DOUBLE TAP HANDLER
    const handleDoubleTap = () => {
        // Always show the big heart animation
        setShowBigHeart(true);
        setTimeout(() => setShowBigHeart(false), 800);

        // If NOT liked yet, trigger the like.
        // If ALREADY liked, do nothing (Instagram style) - just show the animation.
        if (!liked) {
            triggerLike();
        } else {
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    const handleUpdate = async () => {
        if (!editContent.trim()) return;
        setIsSaving(true);
        try {
            await api.put(`/posts/${post.id}`, { description: editContent });
            setDescription(editContent);
            setIsEditing(false);
            setIsMenuOpen(false);
        } catch (error) { alert("Failed to update post."); } finally { setIsSaving(false); }
    };

    const handleDelete = async () => {
        if (window.confirm("Delete this post?")) {
            try { await api.delete(`/posts/${post.id}`); setIsDeleted(true); }
            catch (error) { alert("Failed to delete post."); }
        }
    };

    if (isDeleted) return null;

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-300 mb-8 overflow-hidden animate-fade-in-up">

            <div className="p-5 pb-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link to={`/profile/${post.user?.id}`} className="relative group">
                            <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-md transition-transform group-hover:scale-105">
                                <div className="w-full h-full rounded-full bg-white overflow-hidden border-2 border-white">
                                    {post.user?.avatarUrl ? (
                                        <img src={post.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-indigo-600 bg-slate-50">{post.user?.username?.charAt(0).toUpperCase()}</div>
                                    )}
                                </div>
                            </div>
                        </Link>
                        <div>
                            <Link to={`/profile/${post.user?.id}`} className="font-bold text-slate-800 hover:text-indigo-600 transition-colors block text-[15px]">
                                {post.user?.username}
                            </Link>
                            <span className="text-xs font-semibold text-slate-400">
                                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="relative">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 animate-scale-in">
                                    <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 font-bold">Edit Post</button>
                                    <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-bold">Delete</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Text Content */}
                {isEditing ? (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <textarea className="w-full bg-transparent border-none focus:ring-0 text-slate-700 resize-none outline-none font-medium" rows="3" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
                            <button onClick={handleUpdate} disabled={isSaving} className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">{isSaving ? '...' : 'Save'}</button>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap text-[15px] font-medium">{description}</p>
                )}
            </div>

            {/* MEDIA AREA - DOUBLE TAP ENABLED */}
            {post.mediaUrls?.length > 0 && (
                <div className="relative cursor-pointer group select-none" onDoubleClick={handleDoubleTap}>

                    {/* Big White Heart Overlay */}
                    {showBigHeart && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                            <svg className="w-24 h-24 text-white drop-shadow-2xl animate-big-heart filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                    )}

                    {/* Image Grid */}
                    <div className={`grid gap-0.5 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.mediaUrls.map((url, i) => (
                            <div key={i} className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="p-4 flex items-center gap-6">

                {/* INTERACTIVE LIKE BUTTON */}
                <button
                    onClick={triggerLike}
                    className={`flex items-center gap-2 group transition-transform active:scale-90 ${animateSmallHeart ? 'animate-heart-pop' : ''}`}
                >
                    <div className={`relative p-2 rounded-full transition-colors ${liked ? 'bg-pink-50' : 'hover:bg-slate-50'}`}>
                        {/* Outline Heart (Visible when NOT liked) */}
                        <svg className={`w-7 h-7 transition-all duration-300 ${liked ? 'scale-0 opacity-0 absolute' : 'scale-100 opacity-100 text-slate-500 group-hover:text-pink-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>

                        {/* Filled Heart (Visible when LIKED) */}
                        <svg className={`w-7 h-7 text-pink-500 transition-all duration-300 filter drop-shadow-sm ${liked ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </div>

                    <span className={`text-sm font-bold transition-colors ${liked ? 'text-pink-600' : 'text-slate-500 group-hover:text-pink-500'}`}>
                        {likeCount > 0 ? likeCount : 'Like'}
                    </span>
                </button>

                {/* Comment Button */}
                <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 group transition-all active:scale-95">
                    <div className={`p-2 rounded-full transition-colors ${showComments ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <span className={`text-sm font-bold transition-colors ${showComments ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-600'}`}>
                        {post.comments ? post.comments.length : 0}
                    </span>
                </button>
            </div>

            {showComments && <CommentSection postId={post.id} />}
        </div>
    );
};

export default PostCard;