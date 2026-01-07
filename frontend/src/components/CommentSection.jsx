import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from './LoadingSpinner';

const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    const fetchComments = useCallback(async () => {
        try {
            const response = await api.get(`/posts/${postId}/comments`);
            setComments(response.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [postId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const response = await api.post(`/posts/${postId}/comments`, { content: newComment });
            setComments([response.data, ...comments]);
            setNewComment('');
        } catch (error) { alert("Could not post comment."); } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete?")) return;
        setComments(comments.filter(c => c.id !== id));
        try { await api.delete(`/comments/${id}`); } catch (error) { fetchComments(); }
    };

    return (
        <div className="bg-slate-50/50 border-t border-slate-100 p-6 rounded-b-2xl animate-fade-in">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Discussion</h3>

            <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shadow-sm flex-shrink-0">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 relative group">
                    <input
                        type="text"
                        className="w-full px-5 py-3 pr-12 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
                        placeholder="Add to the discussion..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                    />
                    <button type="submit" disabled={!newComment.trim() || submitting} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 disabled:text-slate-300 transition-all">
                        {submitting ? <LoadingSpinner variant="button" /> : (
                            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        )}
                    </button>
                </div>
            </form>

            {loading ? <div className="py-4"><LoadingSpinner size="small" /></div> : comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm font-medium italic">No comments yet. Be the first!</div>
            ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group animate-slide-in-right">
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold overflow-hidden">
                                {comment.user?.avatarUrl ? <img src={comment.user.avatarUrl} className="w-full h-full object-cover"/> : comment.user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 hover:shadow-md transition-all relative">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-slate-800">{comment.user?.username}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(comment.createdAt))}</span>
                                            {user?.id === comment.user?.id && (
                                                <button onClick={() => handleDelete(comment.id)} className="text-slate-300 hover:text-red-500 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;