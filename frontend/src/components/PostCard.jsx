import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import ReactionPopup from './ReactionPopup'; // Make sure this file exists
import { useAuth } from '../context/useAuth';
import api from '../services/api';

const PostCard = ({ post }) => {
    const { user: currentUser } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- REACTION STATE ---
    const [showReactions, setShowReactions] = useState(false);
    const [myReaction, setMyReaction] = useState(null); // 'LIKE', 'LOVE', etc.
    const [reactionCounts, setReactionCounts] = useState({});

    // --- EDIT/DELETE STATE ---
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.description);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- REPOST STATE ---
    const [isReposting, setIsReposting] = useState(false);

    // --- COMMENT STATE ---
    const [commentCount, setCommentCount] = useState(post.comments ? post.comments.length : 0);

    // Determine if this is a Repost or Original
    const isRepost = !!post.originalPost;
    const displayPost = post.originalPost || post; // The content we actually show

    // Safe User Access
    const postUser = post.user || {};
    const displayUser = displayPost.user || {};

    useEffect(() => {
        // Calculate reactions from the Map (Backend sends: { userId: "LIKE", userId2: "LOVE" })
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

        // Optimistic Update
        setMyReaction(type === oldReaction ? null : type);

        // Update counts locally for immediate UI feedback
        setReactionCounts(prev => {
            const newCounts = { ...prev };
            if (oldReaction) newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 1) - 1);
            if (type !== oldReaction) newCounts[type] = (newCounts[type] || 0) + 1;
            return newCounts;
        });

        try {
            await api.post(`/posts/${post.id}/react?userId=${currentUser.id}&type=${type}`);
        } catch (error) {
            // Revert on fail
            setMyReaction(oldReaction);
            setReactionCounts(prev => { /* Revert logic omitted for brevity, usually a refresh is safer */ return prev; });
        }
    };

    const handleRepost = async () => {
        if(!window.confirm("Repost this to your feed?")) return;
        setIsReposting(true);
        try {
            // Repost endpoint expects multipart/form-data
            const formData = new FormData();
            formData.append('userId', currentUser.id);
            formData.append('originalPostId', post.id);

            await api.post(`/posts`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            alert("Reposted successfully!");
        } catch(e) {
            console.error(e);
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
            // Ideally update the post locally or refresh
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

    if (isDeleted) return null;

    const reactionIcons = {
        LIKE: '👍', LOVE: '❤️', CELEBRATE: '🎉', INSIGHTFUL: '💡', CURIOUS: '🤔'
    };

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 mb-8 overflow-hidden animate-fade-in-up">

            {/* Repost Header */}
            {isRepost && (
                <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span className="font-bold text-slate-700">{postUser.username}</span> reposted
                </div>
            )}

            <div className="p-5 pb-2">
                {/* User Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link to={`/profile/${displayUser.id}`} className="relative group">
                            <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-md">
                                <div className="w-full h-full rounded-full bg-white overflow-hidden">
                                    {displayUser.avatarUrl ? (
                                        <img src={displayUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-indigo-600 bg-slate-50">
                                            {displayUser.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                        <div>
                            <Link to={`/profile/${displayUser.id}`} className="font-bold text-slate-800 hover:text-indigo-600 transition-colors block text-[15px]">
                                {displayUser.username}
                            </Link>
                            <span className="text-xs font-semibold text-slate-400">
                                {new Date(displayPost.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Edit/Delete Menu (Only for Owner of the main post wrapper) */}
                    {currentUser?.id === postUser.id && (
                        <div className="relative">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 animate-scale-in">
                                    {!isRepost && <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 font-bold">Edit Post</button>}
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
                    <p className="text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap text-[15px] font-medium">{displayPost.description}</p>
                )}
            </div>

            {/* Image Content (Fixed for Real Uploads) */}
            {displayPost.imageUrl && (
                <div className="w-full bg-slate-100">
                    <img src={displayPost.imageUrl} alt="Post content" className="w-full h-auto max-h-[600px] object-cover" />
                </div>
            )}

            {/* Reaction Stats Bar */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                <div className="flex items-center gap-1.5 h-6">
                    {Object.keys(reactionCounts).length > 0 ? (
                        <>
                            <div className="flex -space-x-1">
                                {Object.keys(reactionCounts).slice(0, 3).map(type => (
                                    <span key={type} className="w-5 h-5 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 text-sm z-10">
                                        {reactionIcons[type]}
                                    </span>
                                ))}
                            </div>
                            <span className="font-medium ml-1">
                                {Object.values(reactionCounts).reduce((a,b)=>a+b, 0)} reactions
                            </span>
                        </>
                    ) : (
                        <span>Be the first to react</span>
                    )}
                </div>
                <div>
                    {commentCount} comments
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-2 py-1 flex items-center justify-between relative">

                {/* Reaction Button with Hover Popup */}
                <div
                    className="flex-1 relative group/reaction"
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                >
                    {showReactions && <ReactionPopup onSelect={handleReaction} />}

                    <button
                        onClick={() => handleReaction(myReaction ? myReaction : 'LIKE')}
                        className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl transition-all active:scale-95
                            ${myReaction ? 'text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <span className="text-xl">{myReaction ? reactionIcons[myReaction] : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>}</span>
                        <span className="font-bold text-sm">{myReaction || 'Like'}</span>
                    </button>
                </div>

                <button onClick={() => setShowComments(!showComments)} className="flex-1 py-3 flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all active:scale-95 font-bold text-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Comment
                </button>

                <button onClick={handleRepost} disabled={isReposting} className="flex-1 py-3 flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all active:scale-95 font-bold text-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    {isReposting ? '...' : 'Repost'}
                </button>
            </div>

            {showComments && (
                <CommentSection
                    postId={post.id}
                    postOwnerId={postUser.id}
                    onCommentAdded={() => setCommentCount(prev => prev + 1)}
                    onCommentDeleted={() => setCommentCount(prev => prev - 1)}
                />
            )}
        </div>
    );
};

export default PostCard;