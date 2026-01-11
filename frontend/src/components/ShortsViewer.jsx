import { useState, useEffect, useRef } from 'react';
import CommentSection from './CommentSection';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const ShortsViewer = ({ posts, startIndex, onClose, onUpdatePost }) => {
    const { user: currentUser } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [showComments, setShowComments] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false); // Default to false, but might need true for autoplay policy
    const [showHeart, setShowHeart] = useState(false); // For double tap animation

    const videoRef = useRef(null);

    // Derived state
    const post = posts[currentIndex];
    const displayPost = post?.originalPost || post;

    // Helper to find video
    const getMediaUrl = (p) => {
        const urls = p.mediaUrls && p.mediaUrls.length > 0 ? p.mediaUrls : (p.imageUrl ? [p.imageUrl] : []);
        const video = urls.find(url => url.toLowerCase().match(/\.(mp4|webm|mov)$/));
        return video || urls[0];
    };

    const mediaUrl = displayPost ? getMediaUrl(displayPost) : null;

    // Reactions State
    const [myReaction, setMyReaction] = useState(null);
    const [reactionCounts, setReactionCounts] = useState({});

    useEffect(() => {
        if (post && post.reactions) {
            const counts = {};
            Object.values(post.reactions).forEach(t => counts[t] = (counts[t] || 0) + 1);
            setReactionCounts(counts);
            setMyReaction(post.reactions[currentUser?.id] || null);
        }
        setShowComments(false);
        setIsPlaying(true);
        // Reset mute state only if explicit user intent is needed, otherwise keep user preference
    }, [currentIndex, post, currentUser?.id]);

    const handleNext = (e) => { e?.stopPropagation(); if (currentIndex < posts.length - 1) setCurrentIndex(prev => prev + 1); };
    const handlePrev = (e) => { e?.stopPropagation(); if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };

    const togglePlay = (e) => {
        if (e.target.closest('button')) return;
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const handleReaction = async (type) => {
        const oldReaction = myReaction;
        setMyReaction(type === oldReaction ? null : type);

        // Optimistic UI Update
        setReactionCounts(prev => {
            const newCounts = { ...prev };
            if (oldReaction) newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 1) - 1);
            if (type !== oldReaction) newCounts[type] = (newCounts[type] || 0) + 1;
            return newCounts;
        });

        try {
            await api.post(`/posts/${post.id}/react?userId=${currentUser.id}&type=${type}`);
            onUpdatePost(post.id, { ...post, reactions: { ...post.reactions, [currentUser.id]: type === oldReaction ? null : type } });
        } catch (error) {
            setMyReaction(oldReaction); // Revert on failure
        }
    };

    const handleDoubleTap = (e) => {
        e.stopPropagation();
        setShowHeart(true);
        handleReaction('LIKE');
        setTimeout(() => setShowHeart(false), 800);
    };

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') handleNext();
            if (e.key === 'ArrowUp') handlePrev();
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') { e.preventDefault(); togglePlay({ target: { closest: () => null } }); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    if (!post || !mediaUrl) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-fade-in">
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-6 left-6 z-50 text-white/70 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-md transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Main Container */}
            <div className="relative w-full h-full md:max-w-[420px] md:h-[90vh] md:rounded-3xl bg-gray-900 flex items-center justify-center overflow-hidden shadow-2xl border border-white/10">

                {/* Video Layer */}
                <div className="w-full h-full flex items-center bg-black cursor-pointer relative" onClick={togglePlay} onDoubleClick={handleDoubleTap}>
                    <video
                        ref={videoRef}
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted={isMuted} // Controlled mute state
                        playsInline
                    />

                    {/* Pause Overlay */}
                    {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center pl-2 animate-scale-in">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                        </div>
                    )}

                    {/* Double Tap Heart Animation */}
                    {showHeart && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg className="w-32 h-32 text-red-500 drop-shadow-2xl animate-ping-short" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </div>
                    )}
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none"></div>

                {/* Mute Toggle */}
                <button onClick={toggleMute} className="absolute top-4 right-4 z-40 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
                    {isMuted ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeDasharray="2 2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    )}
                </button>

                {/* Right Sidebar Actions */}
                <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6 z-30">
                    <div className="relative group cursor-pointer">
                        <img src={displayPost.user?.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 rounded-full p-0.5 border border-white">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button onClick={() => handleReaction(myReaction || 'LIKE')} className={`w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ${myReaction ? 'text-red-500 bg-white/10' : 'text-white'}`}>
                            <svg className="w-8 h-8" fill={myReaction ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">{Object.values(reactionCounts).reduce((a,b)=>a+b, 0)}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button onClick={() => setShowComments(true)} className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">{displayPost.comments?.length || 0}</span>
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="absolute left-4 bottom-8 right-20 z-30 text-white">
                    <h3 className="font-bold text-lg mb-2 drop-shadow-md flex items-center gap-2">
                        @{displayPost.user?.username}
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Follow</span>
                    </h3>
                    <p className="text-sm font-medium opacity-95 leading-relaxed drop-shadow-md line-clamp-3">{displayPost.description}</p>
                </div>

                {/* Comments Overlay */}
                {showComments && (
                    <div className="absolute inset-0 z-40 bg-black/60 flex flex-col justify-end animate-fade-in">
                        <div className="bg-white rounded-t-3xl h-[70%] w-full flex flex-col overflow-hidden animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-sm">Comments ({displayPost.comments?.length || 0})</h3>
                                <button onClick={() => setShowComments(false)} className="p-1 hover:bg-gray-200 rounded-full">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-white">
                                <CommentSection postId={post.id} postOwnerId={post.user?.id} />
                            </div>
                        </div>
                        <div className="flex-1" onClick={() => setShowComments(false)}></div>
                    </div>
                )}
            </div>

            {/* Desktop Navigation Arrows */}
            <button onClick={handlePrev} disabled={currentIndex === 0} className="hidden md:block absolute top-1/2 left-8 -translate-y-1/2 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all disabled:opacity-0 hover:scale-110">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button onClick={handleNext} disabled={currentIndex === posts.length - 1} className="hidden md:block absolute top-1/2 right-8 -translate-y-1/2 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all disabled:opacity-0 hover:scale-110">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
        </div>
    );
};

export default ShortsViewer;