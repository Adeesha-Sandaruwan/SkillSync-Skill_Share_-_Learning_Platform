import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection';
import ReactionPopup from './ReactionPopup';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

// --- CONFIGURATION: LinkedIn Style Colors & Icons ---
const REACTION_CONFIG = {
    LIKE: { icon: '👍', label: 'Like', color: 'text-blue-600' },
    LOVE: { icon: '❤️', label: 'Love', color: 'text-red-500' },
    CELEBRATE: { icon: '👏', label: 'Celebrate', color: 'text-green-600' },
    INSIGHTFUL: { icon: '💡', label: 'Insightful', color: 'text-amber-600' },
    CURIOUS: { icon: '🤔', label: 'Curious', color: 'text-purple-600' }
};

const PostCard = ({ post, onOpenVideo, onDeleteSuccess }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [showComments, setShowComments] = useState(false);
    const [showReactions, setShowReactions] = useState(false);

    // Reaction List Modal
    const [showReactionListModal, setShowReactionListModal] = useState(false);
    const [reactedUsers, setReactedUsers] = useState([]);
    const [loadingReactedUsers, setLoadingReactedUsers] = useState(false);

    // Local State
    const [myReaction, setMyReaction] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [topReactionIcons, setTopReactionIcons] = useState([]);

    const [isCopied, setIsCopied] = useState(false);
    const [isReposting, setIsReposting] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.description);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const hoverTimeoutRef = useRef(null);
    const likeButtonRef = useRef(null);

    // Data Extraction
    const displayPost = post.originalPost || post;
    const isRepost = !!post.originalPost;
    const postUser = post.user || {};
    const displayUser = displayPost.user || {};
    const mediaUrls = displayPost.mediaUrls?.length > 0 ? displayPost.mediaUrls : (displayPost.imageUrl ? [displayPost.imageUrl] : []);
    const linkedPlan = displayPost.learningPlan;
    const commentCount = post.comments?.length || 0;
    const repostCount = post.repostCount || 0;

    // --- INITIALIZE & CALCULATE STATS ---
    useEffect(() => {
        if (post.reactions) {
            const reactionValues = Object.values(post.reactions);
            setTotalCount(reactionValues.length);
            setMyReaction(post.reactions[currentUser?.id] || null);

            // Calculate Top 3 Unique Icons for the display stack (e.g. 👍 ❤️ 💡)
            const uniqueTypes = [...new Set(reactionValues)];
            const topIcons = uniqueTypes.slice(0, 3).map(type => REACTION_CONFIG[type]?.icon || '👍');
            setTopReactionIcons(topIcons);
        }
        setEditContent(post.description);
    }, [post, currentUser?.id]);

    // --- KEYBOARD NAV FOR LIGHTBOX ---
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

    // --- HANDLERS ---
    const handleMediaClick = (url, index) => {
        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
        if (isVideo) { if (onOpenVideo) onOpenVideo(); } else { setLightboxIndex(index); }
    };
    const handleNextImage = (e) => { e?.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % mediaUrls.length); };
    const handlePrevImage = (e) => { e?.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length); };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/post/${post.id}`;
        try {
            if (navigator.share) await navigator.share({ title: 'SkillSync Post', url: shareUrl });
            else { await navigator.clipboard.writeText(shareUrl); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }
        } catch (error) { console.error("Error sharing:", error); }
    };

    const handleRepost = async () => {
        if (!window.confirm("Repost this to your feed?")) return;
        setIsReposting(true);
        try {
            const formData = new FormData();
            formData.append('userId', currentUser.id);
            formData.append('originalPostId', post.id);
            await api.post('/posts', formData);
            alert("Reposted successfully!");
            if (onDeleteSuccess) onDeleteSuccess(post.id); // Refresh feed
        } catch (error) { alert("Failed to repost."); } finally { setIsReposting(false); }
    };

    const handleReaction = async (type) => {
        setShowReactions(false);
        const oldReaction = myReaction;
        const isRemoving = oldReaction === type;
        const newReaction = isRemoving ? null : type;

        setMyReaction(newReaction);

        // Optimistic UI Update for Counts/Icons
        setTotalCount(prev => {
            if (oldReaction && !newReaction) return prev - 1; // Removed
            if (!oldReaction && newReaction) return prev + 1; // Added new
            return prev; // Changed type (count stays same)
        });

        // Update stack icons locally for immediate feedback
        if (newReaction && !topReactionIcons.includes(REACTION_CONFIG[newReaction].icon)) {
            setTopReactionIcons(prev => [REACTION_CONFIG[newReaction].icon, ...prev].slice(0, 3));
        }

        try { await api.post(`/posts/${post.id}/react?userId=${currentUser.id}&type=${type}`); }
        catch (error) { setMyReaction(oldReaction); setTotalCount(prev => isRemoving ? prev + 1 : prev - 1); }
    };

    const handleShowReactors = async () => {
        if (totalCount === 0) return;
        setShowReactionListModal(true);
        setLoadingReactedUsers(true);
        try {
            const res = await api.get(`/posts/${post.id}/reactions`);
            setReactedUsers(res.data);
        } catch (error) { console.error(error); } finally { setLoadingReactedUsers(false); }
    };

    const handleDelete = async () => {
        if (window.confirm("Delete this post?")) {
            try { await api.delete(`/posts/${post.id}`); if (onDeleteSuccess) onDeleteSuccess(post.id); } catch (error) { alert("Failed to delete."); }
        }
    };
    const handleUpdate = async () => {
        try { await api.put(`/posts/${post.id}`, { description: editContent }); setIsEditing(false); setIsMenuOpen(false); post.description = editContent; } catch (error) { alert("Failed to update."); }
    };

    // Hover logic for Reaction Popup
    const handleMouseEnter = () => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); setShowReactions(true); };
    const handleMouseLeave = () => { hoverTimeoutRef.current = setTimeout(() => setShowReactions(false), 500); };

    return (
        <>
            {/* LIGHTBOX */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightboxIndex(null)}>
                    <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-white/70 hover:text-white p-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    {mediaUrls.length > 1 && (<><button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-4 hover:bg-white/10 rounded-full"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button><button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-4 hover:bg-white/10 rounded-full"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button></>)}
                    <img src={mediaUrls[lightboxIndex]} className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm" alt="Gallery" onClick={e => e.stopPropagation()} />
                </div>
            )}

            {/* REACTION LIST MODAL */}
            {showReactionListModal && (
                <div className="fixed inset-0 z-[10001] bg-black/40 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowReactionListModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="font-bold text-slate-800 text-base">Reactions</h3>
                            <button onClick={() => setShowReactionListModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-2xl leading-none">&times;</button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto p-2">
                            {loadingReactedUsers ? (
                                <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
                            ) : reactedUsers.length > 0 ? (
                                reactedUsers.map(user => (
                                    <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                                        <div className="relative">
                                            <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}`} className="w-10 h-10 rounded-full border border-slate-100 object-cover" alt="" />
                                            {/* Show the specific emoji they used */}
                                            {user.reactionType && (
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm text-[10px]">
                                                    {REACTION_CONFIG[user.reactionType]?.icon || '👍'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{user.username}</p>
                                            <p className="text-xs text-slate-500">{user.firstname} {user.lastname}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="p-4 text-center text-slate-400 text-sm">No reactions yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN CARD --- */}
            {/* REMOVED DYNAMIC Z-INDEX to prevent whole post popping up */}
            <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-shadow duration-200 mb-4 relative overflow-visible">

                {isRepost && (
                    <div className="px-4 py-2 border-b border-slate-50 flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50/50 rounded-t-2xl">
                        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M17 17H7V7h10v10zm-6-8v6h2V9h-2z" /></svg>
                        <Link to={`/profile/${postUser.id}`} className="hover:text-blue-600 hover:underline">{postUser.username}</Link> reposted this
                    </div>
                )}

                <div className="p-4 pb-2">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <Link to={`/profile/${displayUser.id}`} className="flex gap-3 group">
                            <img src={displayUser.avatarUrl || `https://ui-avatars.com/api/?name=${displayUser.username}`} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 group-hover:underline leading-tight">{displayUser.username}</h3>
                                <p className="text-xs text-slate-500">Level {displayUser.level || 1} Member</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">{new Date(displayPost.createdAt).toLocaleDateString()} • <span className="text-[10px]">🌍</span></p>
                            </div>
                        </Link>
                        {currentUser?.id === postUser.id && (
                            <div className="relative">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">•••</button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-1">
                                        <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Edit</button>
                                        <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50">Delete</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div className="text-sm text-slate-900 whitespace-pre-wrap mb-3 leading-relaxed">
                        {isEditing ? (
                            <>
                                <textarea className="w-full border p-2 rounded-lg text-sm" rows="3" value={editContent} onChange={e => setEditContent(e.target.value)} />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-500">Cancel</button>
                                    <button onClick={handleUpdate} className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-full">Save</button>
                                </div>
                            </>
                        ) : displayPost.description}
                    </div>

                    {linkedPlan && (
                        <div onClick={() => navigate(`/plans/${linkedPlan.id}`)} className="mb-3 border border-slate-200 rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Roadmap Update</span>
                                <h4 className="font-bold text-sm text-slate-800">{linkedPlan.title}</h4>
                            </div>
                            <span className="text-slate-400">→</span>
                        </div>
                    )}
                </div>

                {/* Media */}
                {mediaUrls.length > 0 && (
                    <div className={`w-full overflow-hidden cursor-pointer ${mediaUrls.length > 1 ? 'grid grid-cols-2 gap-0.5 h-72' : ''}`} onClick={() => handleMediaClick(mediaUrls[0], 0)}>
                        {mediaUrls.slice(0, 4).map((url, idx) => {
                            const isVideo = url.endsWith('.mp4') || url.endsWith('.webm');
                            return (
                                <div key={idx} className={`relative bg-black ${mediaUrls.length === 1 ? 'h-auto max-h-[500px]' : 'h-full'}`}>
                                    {isVideo ? (
                                        <video src={url} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <img src={url} className="w-full h-full object-cover" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- STATS BAR (Top of buttons) --- */}
                <div className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
                    {/* Reactions Stack */}
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 hover:underline" onClick={handleShowReactors}>
                        {totalCount > 0 && (
                            <>
                                <div className="flex -space-x-1">
                                    {/* Render Top 3 Unique Icons */}
                                    {topReactionIcons.map((icon, i) => (
                                        <div key={i} className="w-4 h-4 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 relative z-10" style={{ zIndex: 10 - i }}>
                                            <span className="text-[10px]">{icon}</span>
                                        </div>
                                    ))}
                                </div>
                                <span className="ml-1">{totalCount}</span>
                            </>
                        )}
                    </div>

                    {/* Counts */}
                    <div className="flex gap-2">
                        {commentCount > 0 && <span className="hover:text-blue-600 hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>{commentCount} comments</span>}
                        {commentCount > 0 && repostCount > 0 && <span>•</span>}
                        {repostCount > 0 && <span>{repostCount} reposts</span>}
                    </div>
                </div>

                {/* --- ACTION BUTTONS (Bottom) --- */}
                <div className="px-1 sm:px-2 py-1 flex justify-between items-center relative overflow-visible">
                    {/* 1. Like Button with Popover - MOBILE & DESKTOP COMPATIBLE */}
                    <div
                        ref={likeButtonRef}
                        className="relative flex-1"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            setShowReactions(true);
                        }}
                        onTouchEnd={() => {
                            setTimeout(() => setShowReactions(false), 3000);
                        }}
                    >
                        {/* Reaction Popover */}
                        {showReactions && (
                            <>
                                {/* Backdrop for mobile - tap outside to close */}
                                <div
                                    className="fixed inset-0 z-[998] md:hidden"
                                    onClick={() => setShowReactions(false)}
                                />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[999] animate-scale-in origin-bottom" style={{ minWidth: 'max-content' }}>
                                    <ReactionPopup onSelect={handleReaction} />
                                </div>
                            </>
                        )}
                        <button
                            onClick={() => handleReaction(myReaction || 'LIKE')}
                            className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-1 rounded-md transition-colors hover:bg-slate-100 
                                ${myReaction ? REACTION_CONFIG[myReaction].color : 'text-slate-500'}
                            `}
                        >
                            {/* Show Specific Icon if Reacted, else Default Thumb */}
                            <span className={`text-lg transition-transform ${myReaction ? 'scale-110' : ''}`}>
                                {myReaction ? REACTION_CONFIG[myReaction].icon : <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a2.25 2.25 0 012.25 2.25V7.38a2.25 2.25 0 11-4.5 0 .219.219 0 00-.36-.176 9.19 9.19 0 00-3.07 7.293v.379" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5v10.5H7.5V10.5h12zm-12 0v10.5H4.5V10.5h3z" /></svg>}
                            </span>
                            {/* Text Hidden on Mobile */}
                            <span className="font-semibold text-sm hidden sm:inline">
                                {myReaction ? REACTION_CONFIG[myReaction].label : 'Like'}
                            </span>
                        </button>
                    </div>

                    {/* 2. Comment Button */}
                    <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-1 rounded-md text-slate-500 hover:bg-slate-100 font-semibold text-sm transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                        <span className="hidden sm:inline">Comment</span>
                    </button>

                    {/* 3. Repost Button */}
                    <button onClick={handleRepost} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-1 rounded-md text-slate-500 hover:bg-slate-100 font-semibold text-sm transition-colors" disabled={isReposting}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg>
                        <span className="hidden sm:inline">Repost</span>
                    </button>

                    {/* 4. Share Button */}
                    <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-1 rounded-md text-slate-500 hover:bg-slate-100 font-semibold text-sm transition-colors">
                        {isCopied ? <span className="text-green-600 font-bold text-xs">Copied</span> : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                                <span className="hidden sm:inline">Send</span>
                            </>
                        )}
                    </button>
                </div>

                {showComments && (
                    <div className="animate-fade-in bg-slate-50/50 pt-2">
                        <CommentSection postId={post.id} postOwnerId={postUser.id} />
                    </div>
                )}
            </div>
        </>
    );
};

export default PostCard;