import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from './LoadingSpinner';

const PlanCard = ({ plan, onDelete, isOwner }) => {
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCloning, setIsCloning] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this roadmap?")) return;
        setIsDeleting(true);
        try {
            await api.delete(`/plans/${plan.id}`);
            onDelete(plan.id);
        } catch (error) {
            setIsDeleting(false);
        }
    };

    const handleClone = async (e) => {
        e.stopPropagation();
        if (!window.confirm(`Clone "${plan.title}" to your profile?`)) return;
        setIsCloning(true);
        try {
            await api.post(`/plans/${plan.id}/clone?userId=${user.id}`);
            alert("Roadmap cloned successfully! Check your profile.");
            navigate(`/profile/${user.id}`);
        } catch (error) {
            alert("Failed to clone plan.");
        } finally {
            setIsCloning(false);
        }
    };

    const completedCount = plan.steps ? plan.steps.filter(s => s.completed).length : 0;
    const totalSteps = plan.steps ? plan.steps.length : 0;
    const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    return (
        <div
            onClick={() => navigate(`/plans/${plan.id}`)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden group cursor-pointer"
        >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${plan.isPublic ? 'from-blue-400 to-indigo-500' : 'from-slate-300 to-slate-400'}`}></div>

            <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    plan.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                        plan.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                    {plan.difficulty || 'Goal'}
                </span>

                <div className="flex gap-2">
                    {!isOwner && (
                        <button
                            onClick={handleClone}
                            disabled={isCloning}
                            className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-full transition-colors"
                            title="Clone this Roadmap"
                        >
                            {isCloning ? '...' : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 01-2-2V5a2 2 0 012-2h9" /></svg>}
                        </button>
                    )}
                    {isOwner && (
                        <button onClick={handleDelete} disabled={isDeleting} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                            {isDeleting ? <LoadingSpinner variant="button" /> : '🗑'}
                        </button>
                    )}
                </div>
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

            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>{completedCount}/{totalSteps} Steps</span>
                <span>{progressPercent}% Done</span>
            </div>
        </div>
    );
};

export default PlanCard;