import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const PlanCard = ({ plan, onDelete, isOwner }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [steps, setSteps] = useState(plan.steps || []);
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (!window.confirm("Delete this roadmap?")) return;
        setIsDeleting(true);
        try {
            await api.delete(`/plans/${plan.id}`);
            onDelete(plan.id);
        } catch (error) {
            setIsDeleting(false);
        }
    };

    const handleToggleStep = async (stepId) => {
        if (!isOwner) return;

        const updatedSteps = steps.map(step =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
        );
        setSteps(updatedSteps);

        try {
            await api.put(`/plans/steps/${stepId}/toggle`);
        } catch (error) {
            console.error("Failed to toggle step", error);
            setSteps(steps);
        }
    };

    const handleShareToFeed = async () => {
        if (!window.confirm("Share your progress to the Home Feed?")) return;
        setSharing(true);
        try {
            const completedCount = steps.filter(s => s.completed).length;
            const percent = Math.round((completedCount / steps.length) * 100);

            const message = `🚀 Update: I've completed ${percent}% of my "${plan.title}" roadmap! (${completedCount}/${steps.length} steps done). #LearningJourney`;

            await api.post(`/posts`, {
                description: message,
                imageUrl: null
            });

            alert("Posted to feed!");
            navigate('/');
        } catch (error) {
            alert("Failed to share.");
        } finally {
            setSharing(false);
        }
    };

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';

    const completedCount = steps.filter(s => s.completed).length;
    const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

            <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    plan.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                        plan.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                    {plan.difficulty || 'Goal'}
                </span>
                {isOwner && (
                    <button onClick={handleDelete} disabled={isDeleting} className="text-slate-300 hover:text-red-500 transition-colors">
                        {isDeleting ? <LoadingSpinner variant="button" /> : '🗑'}
                    </button>
                )}
            </div>

            <h3 className="text-lg font-extrabold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {plan.title}
            </h3>
            <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{plan.description}</p>

            <div className="w-full bg-slate-100 h-2 rounded-full mb-3 overflow-hidden">
                <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400">{completedCount}/{steps.length} Steps</span>
                {isOwner && (
                    <button
                        onClick={handleShareToFeed}
                        disabled={sharing}
                        className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                    >
                        {sharing ? '...' : '🚀 Share'}
                    </button>
                )}
            </div>

            <div className="border-t border-slate-50 pt-3">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 p-2 rounded-lg transition-colors"
                >
                    <span>{expanded ? 'Hide Steps' : 'View Checklist'}</span>
                    <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {expanded && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                        {steps.length === 0 ? <p className="text-center text-xs text-slate-400 italic">No steps.</p> : steps.map((step, idx) => (
                            <div
                                key={step.id || idx}
                                onClick={() => handleToggleStep(step.id)}
                                className={`flex items-start gap-3 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                                    step.completed ? 'bg-emerald-50 border-emerald-100 opacity-75' : 'bg-white border-slate-100 hover:border-indigo-200'
                                }`}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 ${
                                    step.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'
                                }`}>
                                    {step.completed && <span className="text-[10px]">✓</span>}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-semibold leading-tight ${step.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                        {step.title}
                                    </p>
                                    {step.estimatedTime && <span className="text-[10px] text-slate-400">⏱ {step.estimatedTime}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanCard;