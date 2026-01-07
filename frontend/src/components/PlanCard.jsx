import { useState } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const PlanCard = ({ plan, onDelete, isOwner }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm("Delete plan?")) return;
        setIsDeleting(true);
        try { await api.delete(`/plans/${plan.id}`); onDelete(plan.id); }
        catch (error) { setIsDeleting(false); }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
            {/* Top Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

            <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {plan.topic || 'Goal'}
                </span>
                {isOwner && (
                    <button onClick={handleDelete} disabled={isDeleting} className="text-slate-300 hover:text-red-500 transition-colors">
                        {isDeleting ? <LoadingSpinner variant="button" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                    </button>
                )}
            </div>

            <h3 className="text-lg font-extrabold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                {plan.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{plan.description}</p>

            {plan.resources && (
                <div className="mb-6">
                    <a href={plan.resources.startsWith('http') ? plan.resources : `https://${plan.resources}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        View Resources
                    </a>
                </div>
            )}

            {/* Timeline Visual */}
            <div className="mt-auto pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>{formatDate(plan.startDate)}</span>
                    <span>{formatDate(plan.targetDate)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 w-1/2 rounded-full opacity-80"></div>
                </div>
            </div>
        </div>
    );
};

export default PlanCard;