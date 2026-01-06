const ProgressCard = ({ update }) => {
    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateString));
    };

    return (
        <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-100"></div>
                <div className="w-0.5 h-full bg-gray-100 mt-2"></div>
            </div>
            <div className="flex-1 pb-4">
                <p className="text-gray-800 font-medium text-lg">{update.content}</p>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-1 block">
          {formatDate(update.createdAt)}
        </span>
            </div>
        </div>
    );
};

export default ProgressCard;