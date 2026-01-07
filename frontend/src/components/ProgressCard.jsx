const ProgressCard = ({ update }) => {

    // Define styles based on Type
    const getStyle = (type) => {
        switch (type) {
            case 'MILESTONE':
                return {
                    icon: '🏆',
                    color: 'bg-amber-100 text-amber-600',
                    border: 'border-amber-100',
                    ring: 'ring-amber-100'
                };
            case 'BLOCKER':
                return {
                    icon: '🚧',
                    color: 'bg-red-100 text-red-600',
                    border: 'border-red-100',
                    ring: 'ring-red-100'
                };
            case 'RESOURCE':
                return {
                    icon: '📚',
                    color: 'bg-purple-100 text-purple-600',
                    border: 'border-purple-100',
                    ring: 'ring-purple-100'
                };
            default: // LEARNING
                return {
                    icon: '💡',
                    color: 'bg-blue-100 text-blue-600',
                    border: 'border-blue-100',
                    ring: 'ring-blue-100'
                };
        }
    };

    const style = getStyle(update.type);

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateString));
    };

    return (
        <div className="flex gap-4 group animate-slide-in-right">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm z-10 ${style.color} ring-4 ring-white`}>
                    {style.icon}
                </div>
                <div className="w-0.5 h-full bg-slate-100 -mt-2 group-hover:bg-slate-200 transition-colors"></div>
            </div>

            <div className="flex-1 pb-6">
                <div className={`bg-white p-5 rounded-2xl border ${style.border} shadow-sm group-hover:shadow-md transition-all relative overflow-hidden`}>

                    {/* Badge */}
                    <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${style.color} bg-opacity-20`}>
                        {update.type || 'LEARNING'}
                    </span>

                    <p className="text-slate-800 font-medium text-base leading-relaxed pr-16">
                        {update.content}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                            {formatDate(update.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressCard;