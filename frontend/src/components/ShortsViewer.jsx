import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const ShortsViewer = ({ posts, startIndex, onClose, onUpdatePost }) => {
    const { user: currentUser } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [showComments, setShowComments] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);

    // Derived state for current post
    const post = posts[currentIndex];
    const displayPost = post.originalPost || post;
    const mediaUrl = displayPost.mediaUrls?.[0] || displayPost.imageUrl;
    const isVideo = mediaUrl?.endsWith('.mp4') || mediaUrl?.endsWith('.webm');

    // Reaction State (Local to Viewer)
    const [myReaction, setMyReaction] = useState(null);
    const [reactionCounts, setReactionCounts] = useState({});
    const videoRef = useRef(null);

    // Sync state when switching slides
    useEffect(() => {
        if (post.reactions) {
            const counts = {};
            Object.values(post.reactions).forEach(t => counts[t] = (counts[t] || 0) + 1);
            setReactionCounts(counts);
            setMyReaction(post.reactions[currentUser?.id] || null);
        }
        setShowComments(false);
        setIsPlaying(true);
    }, [currentIndex, post, currentUser?.id]);

    const handleNext = (e) => {
        e?.stopPropagation();
        if (currentIndex < posts.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    const togglePlay = (e) => {
        if (e.target.closest('button')) return; // Ignore button clicks
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleReaction = async (type) => {
        const oldReaction = myReaction;
        setMyReaction(type === oldReaction ? null : type);

        // Optimistic count update
        setReactionCounts(prev => {
            const newCounts = { ...prev };
            if (oldReaction) newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 1) - 1);
            if (type !== oldReaction) newCounts[type] = (newCounts[type] || 0) + 1;
            return newCounts;
        });

        // Call API
        try {
            await api.post(`/posts/${post.id}/react?userId=${currentUser.id}&type=${type}`);
            // Notify Parent to update the Feed list in background
            onUpdatePost(post.id, { ...post, reactions: { ...post.reactions, [currentUser.id]: type === oldReaction ? null : type } });
        } catch (error) {
            setMyReaction(oldReaction); // Revert
        }
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') handleNext();
            if (e.key === 'ArrowUp') handlePrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    if (!post) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">

            {/* CLOSE BUTTON */}
            <button
                onClick={onClose}
                className="absolute top-6 left-6 z-50 text-white/70 hover:text-white bg-black/40 p-2 rounded-full backdrop-blur-md"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* MAIN CONTENT AREA */}
            <div className="relative w-full h-full md:max-w-[450px] bg-gray-900 flex items-center justify-center overflow-hidden shadow-2xl">

                {/* MEDIA */}
                <div className="w-full h-full flex items-center bg-black" onClick={togglePlay}>
                    {isVideo ? (
                        <>
                            <video
                                ref={videoRef}
                                src={mediaUrl}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                playsInline
                            />
                            {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center pl-1">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <img src={mediaUrl} className="w-full h-auto max-h-screen object-contain" alt="" />
                    )}
                </div>

                {/* OVERLAYS (Shadow Gradient) */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none"></div>

                {/* RIGHT SIDE ACTIONS (Like, Comment, Share) */}
                <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-30">

                    {/* AVATAR */}
                    <div className="relative">
                        <img src={displayPost.user?.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 rounded-full p-0.5">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                        </div>
                    </div>

                    {/* LIKE */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => handleReaction(myReaction || 'LIKE')}
                            className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ${myReaction ? 'text-red-500' : 'text-white'}`}
                        >
                            <svg className="w-7 h-7" fill={myReaction ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </button>
                        <span className="text-white text-xs font-bold">{Object.values(reactionCounts).reduce((a,b)=>a+b, 0)}</span>
                    </div>

                    {/* COMMENT */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => setShowComments(true)}
                            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform"
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                        </button>
                        <span className="text-white text-xs font-bold">{displayPost.comments?.length || 0}</span>
                    </div>

                    {/* NAVIGATION ARROWS (Visible on Desktop) */}
                    <div className="hidden md:flex flex-col gap-2 mt-4">
                        <button onClick={handlePrev} disabled={currentIndex === 0} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 disabled:opacity-30">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button onClick={handleNext} disabled={currentIndex === posts.length - 1} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 disabled:opacity-30">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                </div>

                {/* BOTTOM INFO (Caption & User) */}
                <div className="absolute left-4 bottom-6 right-20 z-30 text-white">
                    <h3 className="font-bold text-lg mb-1 drop-shadow-md">@{displayPost.user?.username}</h3>
                    <p className="text-sm font-medium opacity-90 leading-relaxed drop-shadow-md">
                        {displayPost.description}
                    </p>
                </div>

                {/* COMMENT DRAWER (Sliding Up) */}
                {showComments && (
                    <div className="absolute inset-0 z-40 bg-black/60 flex flex-col justify-end animate-fade-in">
                        <div
                            className="bg-white rounded-t-3xl h-[70%] w-full flex flex-col overflow-hidden animate-slide-up"
                            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
                        >
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800">Comments ({displayPost.comments?.length || 0})</h3>
                                <button onClick={() => setShowComments(false)} className="p-1 hover:bg-gray-200 rounded-full">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-white">
                                <CommentSection
                                    postId={post.id}
                                    postOwnerId={post.user?.id}
                                    onCommentAdded={() => { /* Handled internally by CommentSection usually */ }}
                                />
                            </div>
                        </div>
                        {/* Click outside to close comments */}
                        <div className="flex-1" onClick={() => setShowComments(false)}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShortsViewer;