import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from './LoadingSpinner';

const CommentSection = ({ postId, postOwnerId, onCommentAdded, onCommentDeleted }) => {
    const { user: currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await api.get(`/posts/${postId}/comments`);
                setComments(response.data);
            } catch (error) {
                console.error("Failed to load comments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        const tempId = Date.now();

        const tempComment = {
            id: tempId,
            content: newComment,
            createdAt: new Date().toISOString(),
            user: {
                id: currentUser.id,
                username: currentUser.username,
                avatarUrl: currentUser.avatarUrl
            },
            isTemp: true
        };

        setComments(prev => [tempComment, ...prev]);
        setNewComment('');
        if (onCommentAdded) onCommentAdded();

        try {
            const response = await api.post(`/posts/${postId}/comments`, { content: tempComment.content });

            setComments(prev => prev.map(c => c.id === tempId ? response.data : c));
        } catch (error) {
            console.error("Failed to post comment", error);
            setComments(prev => prev.filter(c => c.id !== tempId));
            alert("Failed to post comment. Please try again.");
            if (onCommentDeleted) onCommentDeleted();
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;

        const previousComments = [...comments];
        setComments(prev => prev.filter(c => c.id !== commentId));
        if (onCommentDeleted) onCommentDeleted();

        try {
            await api.delete(`/comments/${commentId}`);
        } catch (error) {
            console.error("Failed to delete comment", error);
            alert("Could not delete comment.");
            setComments(previousComments);
            if (onCommentAdded) onCommentAdded();
        }
    };

    if (loading) return <div className="p-4 flex justify-center"><LoadingSpinner /></div>;

    return (
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                    {currentUser?.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                            {currentUser?.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-12"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 disabled:text-slate-300 hover:text-indigo-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </form>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-sm">No comments yet. Be the first!</div>
                ) : (
                    comments.map(comment => {
                        const isCommentOwner = currentUser?.id === comment.user.id;
                        const isPostOwner = currentUser?.id === postOwnerId;
                        const canDelete = isCommentOwner || isPostOwner;

                        return (
                            <div key={comment.id} className={`flex gap-3 group ${comment.isTemp ? 'opacity-70' : ''}`}>
                                <Link to={`/profile/${comment.user.id}`} className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 overflow-hidden">
                                        {comment.user.avatarUrl ? (
                                            <img src={comment.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-600">
                                                {comment.user.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="flex-1">
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm inline-block min-w-[200px] relative group-hover:border-slate-200 transition-colors">
                                        <div className="flex justify-between items-start gap-4">
                                            <Link to={`/profile/${comment.user.id}`} className="text-xs font-bold text-slate-800 hover:underline">
                                                {comment.user.username}
                                            </Link>
                                            <span className="text-[10px] text-slate-400">
                                                {comment.isTemp ? 'Posting...' : new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap break-words">{comment.content}</p>

                                        {canDelete && !comment.isTemp && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="absolute -right-2 -top-2 w-5 h-5 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-100 border border-red-100"
                                                title="Delete comment"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CommentSection;