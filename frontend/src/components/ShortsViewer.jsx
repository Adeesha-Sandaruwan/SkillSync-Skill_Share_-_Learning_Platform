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
    const [isMuted, setIsMuted] = useState(false);
    const [showHeart, setShowHeart] = useState(false);

    // Follow State
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);

    const videoRef = useRef(null);

    const post = posts[currentIndex];
    const displayPost = post?.originalPost || post;

    const getMediaUrl = (p) => {
        const urls = p.mediaUrls && p.mediaUrls.length > 0 ? p.mediaUrls : (p.imageUrl ? [p.imageUrl] : []);
        const video = urls.find(url => url.toLowerCase().match(/\.(mp4|webm|mov)$/));
        return video || urls[0];
    };
    const mediaUrl = displayPost ? getMediaUrl(displayPost) : null;

    const [myReaction, setMyReaction] = useState(null);
    const [reactionCounts, setReactionCounts] = useState({});

    // Reset state when video changes
    useEffect(() => {
        if (post && post.reactions) {
            const counts = {};
            Object.values(post.reactions).forEach(t => counts[t] = (counts[t] || 0) + 1);
            setReactionCounts(counts);
            setMyReaction(post.reactions[currentUser?.id] || null);
        }
        setShowComments(false);
        setIsPlaying(true);
        setIsFollowing(false); // Reset follow state per video (ideally verify from backend)

        // Check if I follow this user (Basic check if backend supported it, else default false)
        checkIfFollowing();

    }, [currentIndex, post, currentUser?.id]);

    const checkIfFollowing = async () => {
        if(!displayPost?.user?.id) return;
        try {
            const res = await api.get(`/users/${displayPost.user.id}/is-following?followerId=${currentUser.id}`);
            setIsFollowing(res.data);
        } catch (e) { console.error(e); }
    };

    const handleFollow = async () => {
        if (loadingFollow) return;
        setLoadingFollow(true);
        try {
            if (isFollowing) {
                await api.post(`/users/${displayPost.user.id}/unfollow?followerId=${currentUser.id}`);
                setIsFollowing(false);
            } else {
                await api.post(`/users/${displayPost.user.id}/follow?followerId=${currentUser.id}`);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Follow failed", error);
        } finally {
            setLoadingFollow(false);
        }
    };

    const handleReaction = async (type) => {
        const oldReaction = myReaction;

        // Toggle logic
        const newReaction = type === oldReaction ? null : type;
        setMyReaction(newReaction);

        setReactionCounts(prev => {
            const newCounts = { ...prev };
            if (oldReaction) newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 1) - 1);
            if (newReaction) newCounts[newReaction] = (newCounts[newReaction] || 0) + 1;
            return newCounts;
        });

        try {
            await api.post(`/posts/${post.id}/react?userId=${currentUser.id}&type=${type}`);
            // Update the global list so when you close shorts, the feed is updated
            onUpdatePost(post.id, {
                ...post,
                reactions: {
                    ...post.reactions,
                    [currentUser.id]: newReaction
                }
            });
        } catch (error) {
            setMyReaction(oldReaction);
        }
    };

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
    const handleDoubleTap = (e) => {
        e.stopPropagation();
        setShowHeart(true);
        handleReaction('LIKE');
        setTimeout(() => setShowHeart(false), 800);
    };

    // Keyboard support
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

    const totalReactions = Object.values(reactionCounts).reduce((a,b)=>a+b, 0);

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-fade-in">
            <button onClick={onClose} className="absolute top-6 left-6 z-50 text-white/70 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="relative w-full h-full md:max-w-[420px] md:h-[90vh] md:rounded-3xl bg-gray-900 flex items-center justify-center overflow-hidden shadow-2xl border border-white/10">
                <div className="w-full h-full flex items-center bg-black cursor-pointer relative" onClick={togglePlay} onDoubleClick={handleDoubleTap}>
                    <video ref={videoRef} src={mediaUrl} className="w-full h-full object-cover" autoPlay loop muted={isMuted} playsInline />
                    {!isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"><div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center pl-2"><svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div>}
                    {showHeart && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><svg className="w-32 h-32 text-red-500 drop-shadow-2xl animate-ping-short" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>}
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none"></div>

                {/* Sidebar Actions */}
                <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6 z-30">
                    <div className="relative group cursor-pointer">
                        <Link to={`/profile/${displayPost.user?.id}`}>
                            <img src={displayPost.user?.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                        </Link>
                        {/* --- FIXED FOLLOW BUTTON --- */}
                        {!isFollowing && currentUser?.id !== displayPost.user?.id && (
                            <button onClick={handleFollow} className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white rounded-full p-0.5 border border-white hover:scale-110 transition-transform">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button onClick={() => handleReaction(myReaction || 'LIKE')} className={`w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ${myReaction ? 'text-red-500 bg-white/10' : 'text-white'}`}>
                            <svg className="w-8 h-8" fill={myReaction ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">{totalReactions}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button onClick={() => setShowComments(true)} className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">{displayPost.comments?.length || 0}</span>
                    </div>
                </div>

                <div className="absolute left-4 bottom-8 right-20 z-30 text-white">
                    <h3 className="font-bold text-lg mb-2 drop-shadow-md flex items-center gap-2">
                        @{displayPost.user?.username}
                        {isFollowing && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full border border-white/20">Following</span>}
                    </h3>
                    <p className="text-sm font-medium opacity-95 leading-relaxed drop-shadow-md line-clamp-3">{displayPost.description}</p>
                </div>

                {showComments && (
                    <div className="absolute inset-0 z-40 bg-black/60 flex flex-col justify-end animate-fade-in">
                        <div className="bg-white rounded-t-3xl h-[70%] w-full flex flex-col overflow-hidden animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 text-sm">Comments</h3>
                                <button onClick={() => setShowComments(false)} className="p-1 hover:bg-gray-200 rounded-full"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-white">
                                <CommentSection postId={post.id} postOwnerId={post.user?.id} />
                            </div>
                        </div>
                        <div className="flex-1" onClick={() => setShowComments(false)}></div>
                    </div>
                )}
            </div>

            {/* Desktop Navigation */}
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