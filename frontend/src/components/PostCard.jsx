import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import ReactionPopup from './ReactionPopup';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

const PostCard = ({ post, onOpenVideo, onDeleteSuccess }) => {
    const { user: currentUser } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [myReaction, setMyReaction] = useState(null);
    const [reactionCounts, setReactionCounts] = useState({});

    // Menu & Edit States
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.description);

    // --- GALLERY STATE (Index Tracking) ---
    const [lightboxIndex, setLightboxIndex] = useState(null); // null = closed, number = open

    // Derived Data
    const displayPost = post.originalPost || post;
    const isRepost = !!post.originalPost;
    const postUser = post.user || {};
    const displayUser = displayPost.user || {};

    // Get all media items (Images + Videos)
    // For the Image Gallery, we usually filter out videos, but if your design mixes them, we can keep them.
    // However, since Videos open a specific Player, this gallery is strictly for the Images in the post.
    const mediaUrls = displayPost.mediaUrls && displayPost.mediaUrls.length > 0
        ? displayPost.mediaUrls
        : (displayPost.imageUrl ? [displayPost.imageUrl] : []);

    useEffect(() => {
        if (post.reactions) {
            const counts = {};
            Object.values(post.reactions).forEach(t => counts[t] = (counts[t] || 0) + 1);
            setReactionCounts(counts);
            setMyReaction(post.reactions[currentUser?.id] || null);
        }
        setEditContent(post.description);
    }, [post, currentUser?.id]);

    // Keyboard Navigation for Gallery
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowRight') handleNextImage(e);
            if (e.key === 'ArrowLeft') handlePrevImage(e);
            if (e.key === 'Escape') setLightboxIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex]);

    const handleReaction = async (type) => {
        setShowReactions(false);
        const oldReaction = myReaction;
        setMyReaction(type === oldReaction ? null : type);
        setReactionCounts(prev => {
            const newCounts = { ...prev };
            if (oldReaction) newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 1) - 1);
            if (type !== oldReaction) newCounts[type] = (newCounts[type] || 0) + 1;
            return newCounts;
        });

        try {
            await api.post(`/posts/${post.id}/react?userId=${currentUser.id}&type=${type}`);
        } catch (error) {
            setMyReaction(oldReaction);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Delete this post?")) {
            try {
                await api.delete(`/posts/${post.id}`);
                if (onDeleteSuccess) onDeleteSuccess(post.id);
            } catch (error) {
                alert("Failed to delete.");
            }
        }
    };

    const handleUpdate = async () => {
        try {
            await api.put(`/posts/${post.id}`, { description: editContent });
            setIsEditing(false);
            setIsMenuOpen(false);
            post.description = editContent;
        } catch (error) { alert("Failed to update."); }
    };

    // --- MEDIA CLICK HANDLER ---
    const handleMediaClick = (url, index) => {
        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
        if (isVideo) {
            // Videos go to Shorts Player
            if (onOpenVideo) onOpenVideo();
        } else {
            // Images go to Local Gallery
            setLightboxIndex(index);
        }
    };

    // --- GALLERY NAVIGATION ---
    const handleNextImage = (e) => {
        e?.stopPropagation();
        setLightboxIndex((prev) => (prev + 1) % mediaUrls.length);
    };

    const handlePrevImage = (e) => {
        e?.stopPropagation();
        setLightboxIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
    };

    const reactionIcons = { LIKE: '👍', LOVE: '❤️', CELEBRATE: '🎉', INSIGHTFUL: '💡', CURIOUS: '🤔' };

    return (
        <>
            {/* --- IMAGE GALLERY TILE (POP-OUT) --- */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setLightboxIndex(null)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-scale-in border border-white/20"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* CLOSE BUTTON */}
                        <button
                            onClick={() => setLightboxIndex(null)}
                            className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* NAVIGATION ARROWS (Only if > 1 image) */}
                        {mediaUrls.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </>
                        )}

                        {/* IMAGE CONTAINER */}
                        <div className="bg-slate-100 flex items-center justify-center h-[80vh] w-full relative">
                            {/* Display Current Image */}
                            <img
                                key={lightboxIndex} // Force re-render on switch for animation
                                src={mediaUrls[lightboxIndex]}
                                className="max-w-full max-h-full object-contain shadow-lg animate-fade-in"
                                alt="Gallery view"
                            />

                            {/* Counter Indicator */}
                            {mediaUrls.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                                    {lightboxIndex + 1} / {mediaUrls.length}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 mb-8 overflow-hidden relative">

                {isRepost && (
                    <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="font-bold text-slate-700">{postUser.username}</span> reposted
                    </div>
                )}

                <div className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <img src={displayPost.user?.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <span className="font-bold text-slate-800 block">{displayPost.user?.username}</span>
                                <span className="text-xs text-slate-400">{new Date(displayPost.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {currentUser?.id === postUser.id && (
                            <div className="relative">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-10 overflow-hidden animate-fade-in-down">
                                        <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50">Edit</button>
                                        <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50">Delete</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div>
                            <textarea className="w-full border p-2 rounded-lg" value={editContent} onChange={e => setEditContent(e.target.value)} />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-500">Cancel</button>
                                <button onClick={handleUpdate} className="text-xs font-bold text-indigo-600">Save</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-700 whitespace-pre-wrap">{displayPost.description}</p>
                    )}
                </div>

                {/* MEDIA GRID */}
                {mediaUrls.length > 0 && (
                    <div className={`w-full cursor-pointer ${mediaUrls.length > 1 ? 'grid grid-cols-2 gap-1 h-80' : ''}`}>
                        {mediaUrls.slice(0, 3).map((url, idx) => {
                            const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
                            return (
                                <div
                                    key={idx}
                                    className="relative w-full h-full bg-black overflow-hidden group"
                                    onClick={() => handleMediaClick(url, idx)} // Pass index for gallery
                                >
                                    {isVideo ? (
                                        <>
                                            <video src={url} className="w-full h-full object-cover opacity-90" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center pl-1 text-white">▶</div>
                                            </div>
                                            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded font-bold">VIDEO</span>
                                        </>
                                    ) : (
                                        <img src={url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="relative" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                            {showReactions && <ReactionPopup onSelect={handleReaction} />}
                            <button onClick={() => handleReaction(myReaction || 'LIKE')} className={`font-bold text-sm ${myReaction ? 'text-blue-600' : 'text-slate-500'}`}>
                                {myReaction ? reactionIcons[myReaction] : '👍 Like'} ({Object.values(reactionCounts).reduce((a,b)=>a+b,0)})
                            </button>
                        </div>
                        <button onClick={() => setShowComments(!showComments)} className="font-bold text-sm text-slate-500">Comment ({post.comments?.length || 0})</button>
                    </div>
                </div>

                {showComments && <CommentSection postId={post.id} postOwnerId={postUser.id} />}
            </div>
        </>
    );
};

export default PostCard;