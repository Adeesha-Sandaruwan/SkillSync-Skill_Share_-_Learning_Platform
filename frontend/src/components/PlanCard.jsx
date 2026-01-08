import { useState } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const PlanCard = ({ plan, onDelete, isOwner }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Local state to handle instant UI updates for checkboxes
    const [steps, setSteps] = useState(plan.steps || []);

    const handleDelete = async () => {
        if (!window.confirm("Delete plan?")) return;
        setIsDeleting(true);
        try {
            await api.delete(`/plans/${plan.id}`);
            onDelete(plan.id);
        } catch (error) {
            setIsDeleting(false);
        }
    };

    const handleToggleStep = async (stepId) => {
        if (!isOwner) return; // Only owner can check boxes

        // 1. Optimistic Update (Update UI immediately)
        const updatedSteps = steps.map(step =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
        );
        setSteps(updatedSteps);

        // 2. Send to Backend
        try {
            await api.put(`/plans/steps/${stepId}/toggle`);
        } catch (error) {
            console.error("Failed to toggle step", error);
            setSteps(steps); // Revert if failed
        }
    };

    const formatDate = (date) => {
        if (!date) return 'TBD';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Calculate progress
    const completedCount = steps.filter(s => s.completed).length;
    const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

    return (
        <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

            <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {plan.topic || plan.category || 'Goal'}
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
            <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{plan.description}</p>

            {/* Progress Bar Visual */}
            <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
                <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>

            <div className="mt-auto border-t border-slate-50 pt-4">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 p-2 rounded-lg transition-colors"
                >
                    <span>{expanded ? 'Hide Steps' : `View Steps (${completedCount}/${steps.length})`}</span>
                    <svg className={`w-4 h-4 transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {expanded && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {steps.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 py-2 italic">No steps added yet.</p>
                        ) : (
                            steps.map((step, idx) => (
                                <div
                                    key={step.id || idx}
                                    onClick={() => handleToggleStep(step.id)}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                        step.completed
                                            ? 'bg-emerald-50 border-emerald-100 opacity-75'
                                            : 'bg-white border-slate-100 hover:border-indigo-200'
                                    }`}
                                >
                                    <div className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${
                                        step.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'
                                    }`}>
                                        {step.completed && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold truncate transition-all ${step.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanCard;