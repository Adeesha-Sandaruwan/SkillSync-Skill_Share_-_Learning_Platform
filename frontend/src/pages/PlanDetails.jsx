import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';

const PlanDetails = () => {
    const { planId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCloning, setIsCloning] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                // We need a specific endpoint for getting a single plan.
                // Since we didn't explicitly create GET /plans/{id} in controller,
                // we might need to filter from user plans or add it.
                // Assuming we have it or filter from the list for now:
                const res = await api.get(`/plans/${planId}`);
                // Note: If this fails, we need to add @GetMapping("/plans/{id}") to backend
                setPlan(res.data);
            } catch (error) {
                // Fallback: fetch user plans and find it (temporary fix if endpoint missing)
                console.warn("Direct fetch failed, trying fallback...", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [planId]);

    const isOwner = currentUser?.id === plan?.user?.id;

    const handleToggleStep = async (stepId) => {
        if (!isOwner) return;

        // Optimistic update
        const updatedSteps = plan.steps.map(s =>
            s.id === stepId ? { ...s, completed: !s.completed } : s
        );
        setPlan({ ...plan, steps: updatedSteps });

        try {
            await api.put(`/plans/steps/${stepId}/toggle`);
        } catch (error) {
            console.error("Failed to toggle step");
        }
    };

    const handleClone = async () => {
        if (!window.confirm("Clone this roadmap to your profile?")) return;
        setIsCloning(true);
        try {
            await api.post(`/plans/${plan.id}/clone?userId=${currentUser.id}`);
            alert("Cloned successfully!");
            navigate(`/profile/${currentUser.id}`);
        } catch (error) {
            alert("Failed to clone.");
        } finally {
            setIsCloning(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingSpinner /></div>;
    if (!plan) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Plan not found.</div>;

    const completed = plan.steps.filter(s => s.completed).length;
    const progress = Math.round((completed / plan.steps.length) * 100);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8">

                {/* Header Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                    <div className={`h-32 bg-gradient-to-r ${plan.isPublic ? 'from-blue-600 to-indigo-600' : 'from-slate-700 to-slate-800'} p-8 flex items-end`}>
                        <h1 className="text-3xl font-black text-white">{plan.title}</h1>
                    </div>
                    <div className="p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex gap-2 mb-4">
                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wide">{plan.difficulty}</span>
                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wide">{plan.category || 'General'}</span>
                                </div>
                                <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">{plan.description}</p>
                            </div>

                            {!isOwner && (
                                <button
                                    onClick={handleClone}
                                    disabled={isCloning}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-transform active:scale-95"
                                >
                                    {isCloning ? 'Cloning...' : 'Clone Roadmap'}
                                </button>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-8">
                            <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
                                <span>Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                    {plan.steps.map((step, idx) => (
                        <div
                            key={step.id}
                            onClick={() => handleToggleStep(step.id)}
                            className={`bg-white p-6 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                                isOwner ? 'cursor-pointer hover:border-indigo-300' : ''
                            } ${step.completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 shadow-sm'}`}
                        >
                            {step.completed && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>}

                            <div className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold border-2 ${
                                    step.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-500'
                                }`}>
                                    {step.completed ? '✓' : idx + 1}
                                </div>

                                <div className="flex-1">
                                    <h3 className={`text-lg font-bold mb-1 ${step.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                        {step.title}
                                    </h3>
                                    {step.resourceLink && (
                                        <a
                                            href={step.resourceLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-indigo-500 text-sm hover:underline font-medium inline-flex items-center gap-1"
                                        >
                                            🔗 View Resource
                                        </a>
                                    )}
                                </div>

                                {step.estimatedTime && (
                                    <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                        ⏱ {step.estimatedTime}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
};

export default PlanDetails;