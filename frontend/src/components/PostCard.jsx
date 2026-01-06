import { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';

const PostCard = ({ post }) => {
    const [showComments, setShowComments] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 mb-6">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {post.user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <Link to={`/profile/${post.user?.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {post.user?.username}
                            </Link>
                            <p className="text-xs text-gray-500 font-medium">{formatDate(post.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap text-[15px]">
                    {post.description}
                </p>

                {/* Media Grid */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className={`grid gap-2 mb-4 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.mediaUrls.map((url, index) => (
                            <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={url}
                                    alt="Post content"
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {e.target.style.display = 'none'}}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-sm font-medium">{post.likeCount || 0}</span>
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

            {/* Interactive Comment Section */}
            {showComments && <CommentSection postId={post.id} />}
        </div>
    );
};

export default PostCard;