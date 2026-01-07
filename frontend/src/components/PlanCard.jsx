import { useState } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const PlanCard = ({ plan, onDelete, isOwner }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;

        setIsDeleting(true);
        try {
            await api.delete(`/plans/${plan.id}`);
            onDelete(plan.id);
        } catch (error) {
            console.error("Failed to delete plan", error);
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md hover:border-blue-100 group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-600 mb-2">
            {plan.topic || 'General'}
          </span>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{plan.title}</h3>
                </div>
                {isOwner && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="Delete Plan"
                    >
                        {isDeleting ? (
                            <LoadingSpinner variant="button" className="!w-4 !h-4" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">
                {plan.description}
            </p>

            {/* Resources Section */}
            {plan.resources && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Resources</p>
                    <p className="text-sm text-blue-600 break-words font-medium">
                        {plan.resources}
                    </p>
                </div>
            )}

            {/* Footer / Timeline */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Start</span>
                    <span className="text-xs font-semibold text-gray-700">{formatDate(plan.startDate)}</span>
                </div>

                <div className="flex-1 px-4 flex items-center">
                    <div className="h-0.5 w-full bg-gray-100 relative">
                        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Target</span>
                    <span className="text-xs font-semibold text-gray-700">{formatDate(plan.targetDate)}</span>
                </div>
            </div>
        </div>
    );
};

export default PlanCard;