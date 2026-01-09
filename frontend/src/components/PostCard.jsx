import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import ReactionPopup from './ReactionPopup';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

const PostCard = ({ post, onOpenViewer }) => { // <--- Receive onOpenViewer Prop
    const { user: currentUser } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [myReaction, setMyReaction] = useState(null);
    const [reactionCounts, setReactionCounts] = useState({});

    // Derived Data
    const displayPost = post.originalPost || post;
    const mediaUrls = displayPost.mediaUrls && displayPost.mediaUrls.length > 0
        ? displayPost.mediaUrls
        : (displayPost.imageUrl ? [displayPost.imageUrl] : []);

    useEffect(() => {
        if (post.reactions) {
            const counts = {};
            Object.values(post.reactions).forEach(t => counts[t] = (counts[t] || 0) + 1);
            setReactionCounts(counts);
            setMyReaction(post.reactions[currentUser?.id] || null);
        }
    }, [post, currentUser?.id]);

    // ... (Keep existing handleReaction, handleRepost logic) ...
    const handleReaction = async (type) => { /* ... same as before ... */ };

    const reactionIcons = { LIKE: '👍', LOVE: '❤️', CELEBRATE: '🎉', INSIGHTFUL: '💡', CURIOUS: '🤔' };

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 mb-8 overflow-hidden">

            {/* Header */}
            <div className="p-5 pb-3">
                <div className="flex items-center gap-3">
                    <img src={displayPost.user?.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <span className="font-bold text-slate-800 block">{displayPost.user?.username}</span>
                        <span className="text-xs text-slate-400">{new Date(displayPost.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <p className="mt-3 text-slate-700">{displayPost.description}</p>
            </div>

            {/* MEDIA GRID - CLICKING OPENS GLOBAL VIEWER */}
            {mediaUrls.length > 0 && (
                <div
                    className={`w-full cursor-pointer ${mediaUrls.length > 1 ? 'grid grid-cols-2 gap-1 h-80' : ''}`}
                    onClick={onOpenViewer} // <--- Trigger Parent Viewer
                >
                    {mediaUrls.slice(0, 3).map((url, idx) => (
                        <div key={idx} className="relative w-full h-full bg-black overflow-hidden group">
                            {url.endsWith('.mp4') || url.endsWith('.webm') ? (
                                <>
                                    <video src={url} className="w-full h-full object-cover opacity-90" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center pl-1 text-white">▶</div>
                                    </div>
                                </>
                            ) : (
                                <img src={url} className="w-full h-full object-cover" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Buttons */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-4">
                    {/* Like Button */}
                    <div
                        className="relative"
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                    >
                        {showReactions && <ReactionPopup onSelect={handleReaction} />}
                        <button onClick={() => handleReaction(myReaction || 'LIKE')} className={`font-bold text-sm ${myReaction ? 'text-blue-600' : 'text-slate-500'}`}>
                            {myReaction ? reactionIcons[myReaction] : '👍 Like'}
                        </button>
                    </div>
                    <button onClick={() => setShowComments(!showComments)} className="font-bold text-sm text-slate-500">Comment</button>
                </div>
            </div>

            {showComments && <CommentSection postId={post.id} postOwnerId={post.user?.id} />}
        </div>
    );
};

export default PostCard;