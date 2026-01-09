import { useState, useEffect, useRef } from 'react';
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
    const [lightboxMedia, setLightboxMedia] = useState(null);
    const [lightboxType, setLightboxType] = useState(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef(null);

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

    const mediaUrls = displayPost.mediaUrls && displayPost.mediaUrls.length > 0
        ? displayPost.mediaUrls
        : (displayPost.imageUrl ? [displayPost.imageUrl] : []);

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
        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
        setLightboxMedia(url);
        setLightboxType(isVideo ? 'video' : 'image');
        setIsPlaying(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = (e) => {
        if (e) e.stopPropagation();
        setLightboxMedia(null);
        setLightboxType(null);
        document.body.style.overflow = 'auto';
    };

    const toggleVideoPlay = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    if (isDeleted) return null;

    const reactionIcons = { LIKE: '👍', LOVE: '❤️', CELEBRATE: '🎉', INSIGHTFUL: '💡', CURIOUS: '🤔' };

    return (
        <>
            {/* --- SHORTS STYLE VIEWER --- */}
            {lightboxMedia && (
                <div
                    className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-fade-in"
                    onClick={closeLightbox}
                >
                    {/* CLOSE BUTTON */}
                    <button
                        onClick={closeLightbox}
                        className="fixed top-6 left-6 z-[10001] text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-3 rounded-full backdrop-blur-md transition-all cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    {/* Content Container */}
                    <div className="relative w-full h-full md:max-w-md mx-auto bg-black flex items-center justify-center overflow-hidden" onClick={e => e.stopPropagation()}>

                        {lightboxType === 'video' ? (
                            <>
                                <video
                                    ref={videoRef}
                                    src={lightboxMedia}
                                    autoPlay
                                    loop
                                    playsInline
                                    onClick={toggleVideoPlay}
                                    className="w-full h-full object-cover cursor-pointer"
                                />

                                {/* Play Icon Overlay */}
                                {!isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center pl-1">
                                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                    </div>
                                )}

                                {/* --- SHORTS OVERLAY (Right Side Actions) --- */}
                                <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
                                    {/* Avatar */}
                                    <Link to={`/profile/${displayUser.id}`} className="relative">
                                        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg">
                                            {displayUser.avatarUrl ? <img src={displayUser.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold">{displayUser.username?.charAt(0)}</div>}
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 rounded-full p-0.5 shadow-sm">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                                        </div>
                                    </Link>

                                    {/* Like Button */}
                                    <div className="flex flex-col items-center gap-1">
                                        <button
                                            onClick={() => handleReaction(myReaction || 'LIKE')}
                                            className={`w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90 ${myReaction ? 'text-red-500' : 'text-white'}`}
                                        >
                                            <svg className="w-7 h-7" fill={myReaction ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                        </button>
                                        <span className="text-white text-xs font-bold shadow-black drop-shadow-md">
                                            {Object.values(reactionCounts).reduce((a,b)=>a+b, 0)}
                                        </span>
                                    </div>

                                    {/* Comment Button */}
                                    <div className="flex flex-col items-center gap-1">
                                        <button
                                            onClick={() => { closeLightbox(); setShowComments(true); }}
                                            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-transform active:scale-90"
                                        >
                                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                                        </button>
                                        <span className="text-white text-xs font-bold shadow-black drop-shadow-md">
                                            {commentCount}
                                        </span>
                                    </div>

                                    {/* Share Button */}
                                    <div className="flex flex-col items-center gap-1">
                                        <button
                                            onClick={handleRepost}
                                            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-transform active:scale-90"
                                        >
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                        </button>
                                        <span className="text-white text-xs font-bold shadow-black drop-shadow-md">Share</span>
                                    </div>
                                </div>

                                {/* --- BOTTOM INFO (Username + Caption) --- */}
                                <div className="absolute left-4 bottom-6 right-20 z-20 text-white">
                                    <Link to={`/profile/${displayUser.id}`} className="font-bold text-lg hover:underline mb-2 block shadow-black drop-shadow-md">
                                        @{displayUser.username}
                                    </Link>
                                    <p className="text-sm font-medium leading-snug line-clamp-2 shadow-black drop-shadow-md opacity-90">
                                        {displayPost.description}
                                    </p>
                                </div>

                                {/* Gradient Overlays for Readability */}
                                <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10"></div>
                            </>
                        ) : (
                            // --- IMAGE VIEWER (Standard Lightbox) ---
                            <img
                                src={lightboxMedia}
                                alt="Full screen"
                                className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* --- FEED CARD --- */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 mb-8 overflow-hidden animate-fade-in-up">

                {/* Header Section */}
                {isRepost && (
                    <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="font-bold text-slate-700">{postUser.username}</span> reposted
                    </div>
                )}

                <div className="p-5 pb-3">
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
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px] font-medium">{displayPost.description}</p>
                    )}
                </div>

                {/* --- SMART MEDIA GALLERY --- */}
                {mediaUrls.length > 0 && (
                    <div className="w-full">
                        {/* 1 ITEM: Full Width */}
                        {mediaUrls.length === 1 && (
                            <div onClick={() => openLightbox(mediaUrls[0])} className="w-full cursor-pointer group relative">
                                {mediaUrls[0].endsWith('.mp4') || mediaUrls[0].endsWith('.webm') ? (
                                    <div className="w-full max-h-[600px] bg-black">
                                        <video src={mediaUrls[0]} className="w-full h-full object-contain max-h-[600px]" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                                            <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center pl-1 shadow-lg">
                                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent"></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <img src={mediaUrls[0]} alt="" className="w-full h-auto max-h-[600px] object-cover" />
                                )}
                            </div>
                        )}

                        {/* 2 ITEMS: Split 50/50 */}
                        {mediaUrls.length === 2 && (
                            <div className="grid grid-cols-2 gap-0.5 h-80">
                                {mediaUrls.map((url, idx) => (
                                    <div key={idx} onClick={() => openLightbox(url)} className="relative w-full h-full cursor-pointer group overflow-hidden bg-black">
                                        {url.endsWith('.mp4') || url.endsWith('.webm') ? (
                                            <>
                                                <video src={url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20"><div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center pl-1"><div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent"></div></div></div>
                                            </>
                                        ) : (
                                            <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 3 ITEMS: One Large Left, Two Small Right */}
                        {mediaUrls.length === 3 && (
                            <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-96">
                                <div onClick={() => openLightbox(mediaUrls[0])} className="row-span-2 relative cursor-pointer group overflow-hidden bg-black">
                                    {mediaUrls[0].endsWith('.mp4') || mediaUrls[0].endsWith('.webm') ? (
                                        <>
                                            <video src={mediaUrls[0]} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20"><div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center pl-1"><div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent"></div></div></div>
                                        </>
                                    ) : (
                                        <img src={mediaUrls[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    )}
                                </div>
                                {mediaUrls.slice(1).map((url, idx) => (
                                    <div key={idx} onClick={() => openLightbox(url)} className="relative cursor-pointer group overflow-hidden bg-black">
                                        {url.endsWith('.mp4') || url.endsWith('.webm') ? (
                                            <>
                                                <video src={url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20"><div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center pl-1"><div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent"></div></div></div>
                                            </>
                                        ) : (
                                            <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Reactions */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                    <div className="flex items-center gap-1.5">
                        {Object.keys(reactionCounts).length > 0 ? <span>{Object.values(reactionCounts).reduce((a,b)=>a+b, 0)} reactions</span> : <span>Be the first to react</span>}
                    </div>
                    <div>{commentCount} comments</div>
                </div>

                {/* Action Buttons */}
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