import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchComments();
    }, [postId]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await api.post(`/posts/${postId}/users/${user.id}/comments`, {
                content: newComment
            });
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error("Failed to post comment", error);
            alert("Could not post comment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    return (
        <div className="bg-gray-50 p-4 rounded-b-xl border-t border-gray-100 animate-fade-in">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Discussion</h3>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="flex gap-3 mb-6 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        className="w-full px-4 py-2 pr-12 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                        placeholder="Add a thoughtful comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md text-blue-600 hover:bg-blue-50 disabled:text-gray-300 transition-all"
                    >
                        {submitting ? (
                            // FIX: Added variant="button" here so it stays tiny!
                            <LoadingSpinner variant="button" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
            </form>

            {/* List Area */}
            {loading ? (
                <div className="py-8">
                    {/* Used small size here so it doesn't take up too much space */}
                    <LoadingSpinner size="small" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">No comments yet. Start the conversation!</p>
                </div>
            ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">
                                {comment.user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-semibold text-gray-900">{comment.user?.username}</span>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;