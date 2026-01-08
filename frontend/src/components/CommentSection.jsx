import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const CommentSection = ({ postId }) => {
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
                console.error("Failed to load comments");
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
        try {
            const response = await api.post(`/posts/${postId}/comments`, { content: newComment });
            setComments(prev => [...prev, response.data]);
            setNewComment('');
        } catch (error) {
            console.error("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error("Failed to delete comment");
        }
    };

    if (loading) return <div className="p-4 text-center text-sm text-slate-400">Loading discussion...</div>;

    return (
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 animate-fade-in">
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {comments.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-slate-400 text-sm">No comments yet. Start the conversation!</p>
                    </div>
                ) : (
                    comments.map(comment => {
                        // FIX: Handle nested User object from Java Entity
                        const userObj = comment.user || {};
                        const commentUserId = userObj.id || comment.userId;
                        const commentUserName = userObj.username || comment.userName || "User";
                        const commentUserAvatar = userObj.avatarUrl || comment.userAvatar;
                        const commentDate = comment.createdAt || new Date().toISOString();

                        return (
                            <div key={comment.id} className="flex gap-3 group">
                                {/* Profile Picture Link */}
                                <Link to={`/profile/${commentUserId}`} className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden border border-slate-200 hover:ring-2 hover:ring-indigo-200 transition-all">
                                        {commentUserAvatar ? (
                                            <img src={commentUserAvatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-600">
                                                {commentUserName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="flex-1">
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm relative">
                                        <div className="flex justify-between items-start mb-1">
                                            {/* Username Link */}
                                            <Link
                                                to={`/profile/${commentUserId}`}
                                                className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                                            >
                                                {commentUserName}
                                            </Link>

                                            {(currentUser?.id === commentUserId) && (
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                    title="Delete comment"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                    <div className="ml-2 mt-1 flex items-center gap-3">
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {new Date(commentDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-white border border-slate-200 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-slate-400"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="absolute right-1.5 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
                >
                    {submitting ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CommentSection;