import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import ReactionPopup from './ReactionPopup';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

const PostCard = ({ post }) => {
    const { user: currentUser } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [myReaction, setMyReaction] = useState(null);
    const [reactionCounts, setReactionCounts] = useState({});

    // Media & Lightbox State
    const [lightboxMedia, setLightboxMedia] = useState(null); // URL of media to show full screen
    const [lightboxType, setLightboxType] = useState(null); // 'image' or 'video'

    // Edit/Delete State
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.description);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isReposting, setIsReposting] = useState(false);
    const [commentCount, setCommentCount] = useState(post.comments ? post.comments.length : 0);

    const isRepost = !!post.originalPost;
    const displayPost = post.originalPost || post;
    const postUser = post.user || {};
    const displayUser = displayPost.user || {};

    // --- HANDLE MULTI-MEDIA ---
    const mediaUrls = displayPost.mediaUrls || (displayPost.imageUrl ? [displayPost.imageUrl] : []);

    useEffect(() => {
        if (post.reactions) {
            const counts = {};
            Object.values(post.reactions).forEach(type => {
                counts[type] = (counts[type] || 0) + 1;
            });
            setReactionCounts(counts);
            setMyReaction(post.reactions[currentUser?.id] || null);
        }
        setCommentCount(post.comments ? post.comments.length : 0);
        setEditContent(post.description);
    }, [post, currentUser?.id]);

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

    const handleRepost = async () => {
        if(!window.confirm("Repost this to your feed?")) return;
        setIsReposting(true);
        try {
            const formData = new FormData();
            formData.append('userId', currentUser.id);
            formData.append('originalPostId', post.id);
            await api.post(`/posts`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            alert("Reposted successfully!");
        } catch(e) {
            alert("Failed to repost.");
        } finally {
            setIsReposting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editContent.trim()) return;
        setIsSaving(true);
        try {
            await api.put(`/posts/${post.id}`, { description: editContent });
            setIsEditing(false);
            setIsMenuOpen(false);
            post.description = editContent;
        } catch (error) {
            alert("Failed to update post.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Delete this post?")) {
            try {
                await api.delete(`/posts/${post.id}`);
                setIsDeleted(true);
            } catch (error) {
                alert("Failed to delete post.");
            }
        }
    };

    // --- LIGHTBOX HANDLER ---
    const openLightbox = (url) => {
        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov'); // Simple check
        setLightboxMedia(url);
        setLightboxType(isVideo ? 'video' : 'image');
        document.body.style.overflow = 'hidden'; // Stop background scrolling
    };

    const closeLightbox = () => {
        setLightboxMedia(null);
        document.body.style.overflow = 'auto';
    };

    if (isDeleted) return null;

    const reactionIcons = { LIKE: '👍', LOVE: '❤️', CELEBRATE: '🎉', INSIGHTFUL: '💡', CURIOUS: '🤔' };

    return (
        <>
            {/* --- SHORTS / LIGHTBOX MODAL --- */}
            {lightboxMedia && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 bg-white/10 rounded-full backdrop-blur-md">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        {lightboxType === 'video' ? (
                            <video src={lightboxMedia} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                        ) : (
                            <img src={lightboxMedia} alt="Full screen" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                        )}
                    </div>
                </div>
            )}

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 mb-8 overflow-hidden animate-fade-in-up">
                {isRepost && (
                    <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="font-bold text-slate-700">{postUser.username}</span> reposted
                    </div>
                )}

                <div className="p-5 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link to={`/profile/${displayUser.id}`} className="relative group">
                                <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-md">
                                    <div className="w-full h-full rounded-full bg-white overflow-hidden">
                                        {displayUser.avatarUrl ? <img src={displayUser.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-indigo-600 bg-slate-50">{displayUser.username?.charAt(0).toUpperCase()}</div>}
                                    </div>
                                </div>
                            </Link>
                            <div>
                                <Link to={`/profile/${displayUser.id}`} className="font-bold text-slate-800 hover:text-indigo-600 transition-colors block text-[15px]">{displayUser.username}</Link>
                                <span className="text-xs font-semibold text-slate-400">{new Date(displayPost.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {currentUser?.id === postUser.id && (
                            <div className="relative">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">...</button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20">
                                        {!isRepost && <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-indigo-50 font-bold">Edit Post</button>}
                                        <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-bold">Delete</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <textarea className="w-full bg-transparent border-none focus:ring-0 text-slate-700 resize-none outline-none font-medium" rows="3" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
                                <button onClick={handleUpdate} disabled={isSaving} className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap text-[15px] font-medium">{displayPost.description}</p>
                    )}
                </div>

                {/* --- MEDIA GRID (1, 2, or 3 Items) --- */}
                {mediaUrls.length > 0 && (
                    <div className={`w-full overflow-hidden ${mediaUrls.length === 1 ? 'h-auto' : 'grid grid-cols-2 gap-0.5 h-80'}`}>
                        {mediaUrls.map((url, index) => {
                            const isVideo = url.endsWith('.mp4') || url.endsWith('.webm');
                            const isSingle = mediaUrls.length === 1;
                            const isLastOfThree = mediaUrls.length === 3 && index === 2;

                            return (
                                <div
                                    key={index}
                                    onClick={() => openLightbox(url)}
                                    className={`relative bg-black cursor-pointer group ${isLastOfThree ? 'col-span-2 aspect-[2/1]' : 'aspect-square'} ${isSingle ? 'aspect-auto max-h-[600px]' : ''}`}
                                >
                                    {isVideo ? (
                                        <div className="w-full h-full relative">
                                            <video src={url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-all">
                                                <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center pl-1">
                                                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent"></div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded uppercase">Video</div>
                                        </div>
                                    ) : (
                                        <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                    <div className="flex items-center gap-1.5">
                        {Object.keys(reactionCounts).length > 0 ? <span>{Object.values(reactionCounts).reduce((a,b)=>a+b, 0)} reactions</span> : <span>Be the first to react</span>}
                    </div>
                    <div>{commentCount} comments</div>
                </div>

                <div className="px-2 py-1 flex items-center justify-between relative">
                    <div
                        className="flex-1 relative group/reaction"
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                    >
                        {showReactions && <ReactionPopup onSelect={handleReaction} />}
                        <button onClick={() => handleReaction(myReaction || 'LIKE')} className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl transition-all active:scale-95 ${myReaction ? 'text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <span className="text-xl">{myReaction ? reactionIcons[myReaction] : '👍'}</span>
                            <span className="font-bold text-sm">{myReaction || 'Like'}</span>
                        </button>
                    </div>

                    <button onClick={() => setShowComments(!showComments)} className="flex-1 py-3 flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all active:scale-95 font-bold text-sm">
                        Comment
                    </button>
                    <button onClick={handleRepost} disabled={isReposting} className="flex-1 py-3 flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all active:scale-95 font-bold text-sm">
                        Repost
                    </button>
                </div>

                {showComments && <CommentSection postId={post.id} postOwnerId={postUser.id} onCommentAdded={() => setCommentCount(prev => prev + 1)} onCommentDeleted={() => setCommentCount(prev => prev - 1)} />}
            </div>
        </>
    );
};

export default PostCard;