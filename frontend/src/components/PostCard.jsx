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
    const [showReactions, setShowReactions] = useState(false);

    // Reaction List State
    const [showReactionListModal, setShowReactionListModal] = useState(false);
    const [reactedUsers, setReactedUsers] = useState([]);
    const [loadingReactedUsers, setLoadingReactedUsers] = useState(false);

    // Reaction State
    const [myReaction, setMyReaction] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [isCopied, setIsCopied] = useState(false);
    const [isReposting, setIsReposting] = useState(false);

    const hoverTimeoutRef = useRef(null);

    // Edit State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.description);

    // Gallery State
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // Helpers
    const displayPost = post.originalPost || post;
    const isRepost = !!post.originalPost;
    const postUser = post.user || {};
    const displayUser = displayPost.user || {};
    const mediaUrls = displayPost.mediaUrls?.length > 0
        ? displayPost.mediaUrls
        : (displayPost.imageUrl ? [displayPost.imageUrl] : []);
    const linkedPlan = displayPost.learningPlan;
    const commentCount = post.comments?.length || 0;

    // Determine repost count (mock logic if backend doesn't send it, or assume 0 for now)
    // If you add a 'repostCount' to your backend DTO later, use post.repostCount
    const repostCount = post.repostCount || 0;

    // --- INITIALIZE ---
    useEffect(() => {
        if (post.reactions) {
            const count = Object.keys(post.reactions).length;
            setTotalCount(count);
            setMyReaction(post.reactions[currentUser?.id] || null);
        }
        setEditContent(post.description);
    }, [post, currentUser?.id]);

    // --- KEYBOARD NAV ---
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
        if (isVideo) {
            if (onOpenVideo) onOpenVideo();
        } else {
            setLightboxIndex(index);
        }
    };

    const handleNextImage = (e) => { e?.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % mediaUrls.length); };
    const handlePrevImage = (e) => { e?.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length); };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/post/${post.id}`;
        const shareData = {
            title: `Post by ${displayUser.username}`,
            text: displayPost.description ? displayPost.description.substring(0, 100) + '...' : 'Check out this post on SkillSync!',
            url: shareUrl
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }
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
            if (onDeleteSuccess) onDeleteSuccess();
        } catch (error) {
            console.error("Repost failed", error);
            alert("Failed to repost.");
        } finally {
            setIsReposting(false);
        }
    };

    const handleReaction = async (type) => {
        setShowReactions(false);
        const oldReaction = myReaction;
        const isRemoving = oldReaction === type;
        const newReaction = isRemoving ? null : type;

        setMyReaction(newReaction);
        setTotalCount(prev => {
            if (oldReaction && !newReaction) return prev - 1;
            if (!oldReaction && newReaction) return prev + 1;
            return prev;
        });

        try {
            await api.post(`/posts/${post.id}/react?userId=${currentUser.id}&type=${type}`);
        } catch (error) {
            setMyReaction(oldReaction);
            setTotalCount(prev => isRemoving ? prev + 1 : prev - 1);
        }
    };

    const handleShowReactors = async () => {
        if (totalCount === 0) return;
        setShowReactionListModal(true);
        setLoadingReactedUsers(true);
        try {
            const res = await api.get(`/posts/${post.id}/reactions`);
            setReactedUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingReactedUsers(false);
        }
    };

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setShowReactions(true);
    };

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => setShowReactions(false), 300);
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

    const reactionIcons = { LIKE: '👍', LOVE: '❤️', CELEBRATE: '🎉', INSIGHTFUL: '💡', CURIOUS: '🤔' };

    return (
        <>
            {/* LIGHTBOX OVERLAY */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightboxIndex(null)}>
                    <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setLightboxIndex(null)} className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {mediaUrls.length > 1 && (
                            <>
                                <button onClick={handlePrevImage} className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button onClick={handleNextImage} className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </>
                        )}
                        <img src={mediaUrls[lightboxIndex]} className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg select-none" alt="Gallery" />
                        <div className="mt-4 text-white/50 font-medium text-sm tracking-widest">{lightboxIndex + 1} / {mediaUrls.length}</div>
                    </div>
                </div>
            )}

            {/* --- REACTION LIST MODAL --- */}
            {showReactionListModal && (
                <div className="fixed inset-0 z-[10001] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReactionListModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-lg">People who reacted</h3>
                            <button onClick={() => setShowReactionListModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-xl">&times;</button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                            {loadingReactedUsers ? (
                                <div className="text-center py-6 text-slate-400">Loading...</div>
                            ) : reactedUsers.length > 0 ? (
                                reactedUsers.map(user => (
                                    <Link to={`/profile/${user.id}`} key={user.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                        <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}`} className="w-10 h-10 rounded-full border border-slate-200 object-cover" alt="" />
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{user.username}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">Level {user.level || 1} {user.reactionType && <span className="text-xs bg-slate-100 px-1 rounded">{user.reactionType}</span>}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 py-6">No reactions yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 mb-8 relative group/card ${isMenuOpen || showReactions ? 'z-[100]' : 'z-0'}`}>
                {/* Repost Header */}
                {isRepost && (
                    <div className="bg-slate-50/50 px-5 py-2 border-b border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500 rounded-t-3xl">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <Link to={`/profile/${postUser.id}`} className="hover:text-indigo-600 transition-colors">{postUser.username}</Link> reposted
                    </div>
                )}
                <div className="p-5 pb-2">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 relative">
                        <Link to={`/profile/${displayUser.id}`} className="flex items-center gap-3 group/user">
                            <div className="relative">
                                <img src={displayUser.avatarUrl || `https://ui-avatars.com/api/?name=${displayUser.username}`} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm group-hover/user:scale-105 transition-transform" />
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 block group-hover/user:text-indigo-600 transition-colors">{displayUser.username}</span>
                                <span className="text-xs text-slate-400 font-medium">{new Date(displayPost.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </Link>
                        {currentUser?.id === postUser.id && (
                            <div className="relative">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 text-slate-300 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all">•••</button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-100 z-[101] overflow-hidden animate-scale-in origin-top-right">
                                        <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-b border-slate-50">✏️ Edit Post</button>
                                        <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">🗑️ Delete Post</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Content */}
                    {isEditing ? (
                        <div className="animate-fade-in relative z-20">
                            <textarea className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all resize-none text-sm font-medium" rows="3" value={editContent} onChange={e => setEditContent(e.target.value)} />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button onClick={handleUpdate} className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">Save</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px] mb-4 relative z-20">{displayPost.description}</p>
                    )}
                    {linkedPlan && (
                        <div onClick={() => navigate(`/plans/${linkedPlan.id}`)} className="mb-4 border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all group/plan bg-slate-50/50 relative z-20">
                            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Roadmap Update</span>
                                    <h3 className="font-bold text-slate-800 text-base mt-1 group-hover/plan:text-indigo-600 transition-colors">{linkedPlan.title}</h3>
                                </div>
                                <span className="text-2xl group-hover/plan:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    )}
                </div>
                {mediaUrls.length > 0 && (
                    <div className={`w-full cursor-pointer overflow-hidden relative z-20 ${showComments ? '' : 'rounded-b-3xl'} ${mediaUrls.length > 1 ? 'grid grid-cols-2 h-72' : 'h-auto max-h-[500px]'}`}>
                        {mediaUrls.slice(0, 4).map((url, idx) => {
                            const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
                            return (
                                <div key={idx} className={`relative group/media overflow-hidden bg-black ${mediaUrls.length === 3 && idx === 0 ? 'row-span-2' : ''}`} onClick={() => handleMediaClick(url, idx)}>
                                    {isVideo ? (
                                        <>
                                            <video src={url} className="w-full h-full object-cover opacity-90 group-hover/media:opacity-100 transition-opacity" muted />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/50 shadow-xl"><svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
                                            </div>
                                        </>
                                    ) : (
                                        <img src={url} className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-500" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- STATS BAR (LINKEDIN STYLE) --- */}
                { (totalCount > 0 || commentCount > 0 || repostCount > 0) && (
                    <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100/50 mx-2">
                        {/* LEFT: Reactions */}
                        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 hover:underline" onClick={handleShowReactors}>
                            {totalCount > 0 && (
                                <>
                                    <div className="flex -space-x-1 mr-1">
                                        <div className="bg-blue-500 rounded-full p-[2px] border border-white"><span className="text-[8px] leading-none block">👍</span></div>
                                    </div>
                                    <span>{totalCount}</span>
                                </>
                            )}
                        </div>

                        {/* RIGHT: Comments & Reposts */}
                        <div className="flex items-center gap-2">
                            {commentCount > 0 && (
                                <span className="hover:text-blue-600 hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>
                                    {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                                </span>
                            )}
                            {commentCount > 0 && repostCount > 0 && <span>•</span>}
                            {repostCount > 0 && (
                                <span className="hover:text-blue-600 hover:underline cursor-pointer">
                                    {repostCount} {repostCount === 1 ? 'repost' : 'reposts'}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* --- BUTTON ACTION BAR (NO NUMBERS) --- */}
                <div className={`px-2 py-1 flex items-center justify-between mt-1 relative z-30 ${mediaUrls.length === 0 ? 'rounded-b-3xl' : ''}`}>

                    {/* Like Button */}
                    <div className="relative flex-1" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        {showReactions && (
                            <div className="absolute bottom-full left-4 mb-2 z-[102] animate-scale-in origin-bottom-left shadow-xl rounded-full bg-white p-1 border border-slate-100 flex gap-1">
                                <ReactionPopup onSelect={handleReaction} />
                            </div>
                        )}
                        <button
                            onClick={() => handleReaction(myReaction || 'LIKE')}
                            className={`w-full group flex items-center justify-center gap-2 px-2 py-3 rounded-lg font-bold text-sm transition-all duration-200 active:bg-slate-100
                                ${myReaction
                                ? 'text-blue-600'
                                : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
                            }
                            `}
                        >
                            <span className={`text-xl transition-transform ${myReaction ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {myReaction ? reactionIcons[myReaction] : '👍'}
                            </span>
                            <span className="hidden sm:inline">Like</span>
                        </button>
                    </div>

                    {/* Comment Button */}
                    <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-2 px-2 py-3 rounded-lg font-bold text-sm text-slate-500 hover:bg-slate-100/50 hover:text-slate-700 transition-all active:bg-slate-100">
                        <span className="text-xl">💬</span><span className="hidden sm:inline">Comment</span>
                    </button>

                    {/* Repost Button */}
                    <button onClick={handleRepost} className="flex-1 flex items-center justify-center gap-2 px-2 py-3 rounded-lg font-bold text-sm text-slate-500 hover:bg-slate-100/50 hover:text-slate-700 transition-all active:bg-slate-100" disabled={isReposting}>
                        <span className="text-xl">🔄</span><span className="hidden sm:inline">Repost</span>
                    </button>

                    {/* Share Button (Icon Only) */}
                    <button onClick={handleShare} className="flex-none p-3 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 transition-all" title="Share">
                        {isCopied ? <span className="text-xs font-bold text-green-600">Copied</span> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>}
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="border-t border-slate-100 bg-slate-50/30 animate-fade-in rounded-b-3xl relative z-20">
                        <CommentSection postId={post.id} postOwnerId={postUser.id} />
                    </div>
                )}
            </div>
        </>
    );
};

export default PostCard;