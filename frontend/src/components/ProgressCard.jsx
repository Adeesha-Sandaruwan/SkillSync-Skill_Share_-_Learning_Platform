const ProgressCard = ({ update }) => {
    return (
        <div className="flex gap-4 group">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 group-hover:ring-emerald-200 transition-all shadow-sm"></div>
                <div className="w-0.5 h-full bg-slate-200 my-1 group-hover:bg-emerald-200 transition-colors"></div>
            </div>

            <div className="flex-1 pb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
                    <p className="text-slate-800 font-medium text-base leading-relaxed">{update.content}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(update.createdAt))}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressCard;