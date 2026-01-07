import { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // EDIT & DELETE STATES
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.description);
    const [description, setDescription] = useState(post.description);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // LIKE STATES
    // Check if our user ID is in the list of people who liked the post
    const [liked, setLiked] = useState(post.likedUserIds?.includes(user?.id) || false);
    const [likeCount, setLikeCount] = useState(post.likedUserIds?.length || 0);
    const [isLiking, setIsLiking] = useState(false);

    const isOwner = user?.id === post.user?.id;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await api.delete(`/posts/${post.id}`);
                setIsDeleted(true);
            } catch (error) {
                alert("Failed to delete post.");
            }
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
        } catch (error) {
            alert("Failed to update post.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);

        // Optimistic UI Update (Update screen before server responds)
        const previousLiked = liked;
        const previousCount = likeCount;

        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);

        try {
            await api.post(`/posts/${post.id}/like?userId=${user.id}`);
        } catch (error) {
            // Revert if error
            setLiked(previousLiked);
            setLikeCount(previousCount);
            console.error("Failed to like post");
        } finally {
            setIsLiking(false);
        }
    };

    if (isDeleted) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible hover:shadow-md transition-shadow duration-300 mb-6 relative">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Link to={`/profile/${post.user?.id}`} className="relative">
                            {post.user?.avatarUrl ? (
                                <div className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm overflow-hidden">
                                    <img src={post.user.avatarUrl} alt={post.user.username} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                                    {post.user?.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </Link>
                        <div>
                            <Link to={`/profile/${post.user?.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {post.user?.username}
                            </Link>
                            <p className="text-xs text-gray-500 font-medium">{formatDate(post.createdAt)}</p>
                        </div>
                    </div>

                    {/* Options Menu (Only for Owner) */}
                    {isOwner && (
                        <div className="relative">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                </svg>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 animate-fade-in-down">
                                    <button
                                        onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                                    >
                                        ✏️ Edit Post
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                    >
                                        🗑️ Delete Post
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                {isEditing ? (
                    <div className="mb-4">
            <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows="3"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
            />
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-md">Cancel</button>
                            <button onClick={handleUpdate} disabled={isSaving} className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm">
                                {isSaving ? 'Saving...' : 'Save Updates'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap text-[15px]">{description}</p>
                )}

                {/* Media */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className={`grid gap-2 mb-4 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.mediaUrls.map((url, index) => (
                            <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                <img src={url} alt="Post content" className="w-full h-full object-cover" onError={(e) => {e.target.style.display = 'none'}} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">

                    {/* LIKE BUTTON - Now Fully Functional */}
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-2 transition-colors group ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                    >
                        <svg
                            className={`w-5 h-5 transition-transform ${liked ? 'scale-110 fill-current' : 'group-hover:scale-110'}`}
                            fill={liked ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-sm font-medium">{likeCount}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center space-x-2 transition-colors group ${showComments ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm font-medium">
              {showComments ? 'Hide Comments' : `${post.comments ? post.comments.length : 0} Comments`}
            </span>
                    </button>
                </div>
            </div>

            {showComments && <CommentSection postId={post.id} />}
        </div>
    );
};

export default PostCard;