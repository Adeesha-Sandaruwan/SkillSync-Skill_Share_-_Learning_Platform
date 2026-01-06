import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                    {post.user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <Link to={`/profile/${post.user?.id}`} className="font-semibold text-gray-900 hover:underline">
                        {post.user?.username}
                    </Link>
                    <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <p className="text-gray-800 mb-4">{post.description}</p>

            {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="mb-4 grid grid-cols-1 gap-2">
                    {post.mediaUrls.map((url, index) => (
                        <img key={index} src={url} alt="Post content" className="rounded-lg w-full object-cover max-h-96" />
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between border-t pt-4 text-gray-500 text-sm">
                <button className="flex items-center hover:text-blue-500 space-x-1">
                    <span>👍</span>
                    <span>{post.likeCount} Likes</span>
                </button>
                <Link to={`/post/${post.id}`} className="hover:text-blue-500">
                    {post.comments ? post.comments.length : 0} Comments
                </Link>
            </div>
        </div>
    );
};

export default PostCard;