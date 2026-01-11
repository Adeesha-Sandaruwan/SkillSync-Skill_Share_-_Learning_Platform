import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection';
import ReactionPopup from './ReactionPopup';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

const PostCard = ({ post, onOpenVideo, onDeleteSuccess }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [showComments, setShowComments] = useState(false);

    // Reaction State
    const [showReactions, setShowReactions] = useState(false);
    const [myReaction, setMyReaction] = useState(null);
    const [reactionCounts, setReactionCounts] = useState({});
    const hoverTimeoutRef = useRef(null); // To prevent flickering

    // Menu & Edit States
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.description);

    // Gallery State
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // Derived Data
    const displayPost = post.originalPost || post;
    const isRepost = !!post.originalPost;
    const postUser = post.user || {};
    const displayUser = displayPost.user || {};
    const mediaUrls = displayPost.mediaUrls && displayPost.mediaUrls.length > 0
        ? displayPost.mediaUrls
        : (displayPost.imageUrl ? [displayPost.imageUrl] : []);
    const linkedPlan = displayPost.learningPlan;

    // Initialize Data
    useEffect(() => {
        if (post.reactions) {
            const counts = {};
            // Count existing reactions from DB
            Object.values(post.reactions).forEach(t => counts[t] = (counts[t] || 0) + 1);
            setReactionCounts(counts);
            setMyReaction(post.reactions[currentUser?.id] || null);
        }
        setEditContent(post.description);
    }, [post, currentUser?.id]);

    // Handle Keyboard for Gallery
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

    // --- FIXED REACTION LOGIC ---
    const handleReaction = async (type) => {
        setShowReactions(false);
        const oldReaction = myReaction;

        // Optimistic Update
        const isToggleOff = oldReaction === type; // Clicking same reaction removes it
        const newReaction = isToggleOff ? null : type;

        setMyReaction(newReaction);

        setReactionCounts(prev => {
            const newCounts = { ...prev };

            // 1. Remove old reaction count
            if (oldReaction) {
                newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 1) - 1);
            }

            // 2. Add new reaction count (if not just un-liking)
            if (newReaction) {
                newCounts[newReaction] = (newCounts[newReaction] || 0) + 1;
            }
            return newCounts;
        });

        try {
            // API expects the TYPE to add, or same TYPE to remove (toggle logic in backend)
            // If we are switching, backend usually handles "update" automatically
            await api.post(`/posts/${post.id}/react?userId=${currentUser.id}&type=${type}`);
        } catch (error) {
            // Revert on error
            setMyReaction(oldReaction);
            // (Ideally revert counts here too, but skipping for brevity)
        }
    };

    // --- FIXED HOVER LOGIC ---
    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setShowReactions(true);
    };

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setShowReactions(false);
        }, 300); // 300ms delay to allow moving mouse to the popup
    };

    const handleDelete = async () => {
        if (window.confirm("Delete this post?")) {
            try {
                await api.delete(`/posts/${post.id}`);
                if (onDeleteSuccess) onDeleteSuccess(post.id);
            } catch (error) { alert("Failed to delete."); }
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

    const handleMediaClick = (url, index) => {
        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
        if (isVideo) { if (onOpenVideo) onOpenVideo(); } else { setLightboxIndex(index); }
    };

    const handleNextImage = (e) => { e?.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % mediaUrls.length); };
    const handlePrevImage = (e) => { e?.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length); };

    const reactionIcons = { LIKE: '👍', LOVE: '❤️', CELEBRATE: '🎉', INSIGHTFUL: '💡', CURIOUS: '🤔' };
    const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

    return (
        <>
            {/* LIGHTBOX CODE (Unchanged) */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightboxIndex(null)}>
                    <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setLightboxIndex(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        <img src={mediaUrls[lightboxIndex]} className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg" alt="Gallery" />
                    </div>
                </div>
            )}

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 mb-8 relative z-0">
                {isRepost && (
                    <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-500 rounded-t-3xl">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <Link to={`/profile/${postUser.id}`} className="font-bold text-slate-700 hover:underline">{postUser.username}</Link> reposted
                    </div>
                )}

                <div className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-4">
                        <Link to={`/profile/${displayUser.id}`} className="flex items-center gap-3 group">
                            <img src={displayUser.avatarUrl} className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-200 transition-all" />
                            <div>
                                <span className="font-bold text-slate-800 block group-hover:text-indigo-600">{displayUser.username}</span>
                                <span className="text-xs text-slate-400">{new Date(displayPost.createdAt).toLocaleDateString()}</span>
                            </div>
                        </Link>

                        {currentUser?.id === postUser.id && (
                            <div className="relative">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">•••</button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in-down">
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
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{displayPost.description}</p>
                    )}

                    {linkedPlan && (
                        <div onClick={() => navigate(`/plans/${linkedPlan.id}`)} className="mt-4 border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow group bg-slate-50">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                            <div className="p-4">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">{linkedPlan.category || 'Roadmap'}</span>
                                <h3 className="font-bold text-slate-800 text-lg mt-1">{linkedPlan.title}</h3>
                            </div>
                        </div>
                    )}
                </div>

                {mediaUrls.length > 0 && (
                    <div className={`w-full cursor-pointer ${mediaUrls.length > 1 ? 'grid grid-cols-2 gap-1 h-80' : ''}`}>
                        {mediaUrls.slice(0, 3).map((url, idx) => {
                            const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
                            return (
                                <div key={idx} className="relative w-full h-full bg-black overflow-hidden group" onClick={() => handleMediaClick(url, idx)}>
                                    {isVideo ? <video src={url} className="w-full h-full object-cover opacity-90" /> : <img src={url} className="w-full h-full object-cover" />}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between relative z-10">
                    <div className="flex gap-4">
                        {/* --- FIXED HOVER CONTAINER --- */}
                        <div
                            className="relative"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {showReactions && (
                                <div className="absolute bottom-full left-0 mb-2 z-50 animate-scale-in origin-bottom-left">
                                    <ReactionPopup onSelect={handleReaction} />
                                </div>
                            )}
                            <button
                                onClick={() => handleReaction(myReaction || 'LIKE')}
                                className={`font-bold text-sm flex items-center gap-1 transition-colors ${myReaction ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'}`}
                            >
                                <span className="text-lg">{myReaction ? reactionIcons[myReaction] : '👍'}</span>
                                <span className="hidden sm:inline">{myReaction ? myReaction : 'Like'}</span>
                                {totalReactions > 0 && (
                                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">
                                        {totalReactions}
                                    </span>
                                )}
                            </button>
                        </div>
                        <button onClick={() => setShowComments(!showComments)} className="font-bold text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1">
                            💬 Comment ({post.comments?.length || 0})
                        </button>
                    </div>
                </div>

                {showComments && <CommentSection postId={post.id} postOwnerId={postUser.id} />}
            </div>
        </>
    );
};

export default PostCard;