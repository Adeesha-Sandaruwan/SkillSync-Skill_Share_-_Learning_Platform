import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PlanCard from '../components/PlanCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';

const LearningPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    // 1. ADDED 'steps' TO STATE
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        topic: '',
        resources: '',
        startDate: '',
        targetDate: '',
        category: 'Development', // Default
        difficulty: 'Beginner', // Default
        steps: [{ title: '', resourceLink: '', estimatedTime: '' }] // Start with 1 empty step
    });

    const fetchPlans = useCallback(async () => {
        try {
            const response = await api.get(`/users/${user.id}/plans`);
            setPlans(response.data);
        } catch (error) {
            console.error("Error fetching plans", error);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // 2. STEP LOGIC HANDLERS
    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, { title: '', resourceLink: '', estimatedTime: '' }]
        }));
    };

    const removeStep = (index) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }));
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...formData.steps];
        newSteps[index][field] = value;
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Clean up: remove steps with empty titles
            const payload = {
                ...formData,
                steps: formData.steps.filter(s => s.title.trim() !== '')
            };

            await api.post(`/users/${user.id}/plans`, payload);

            // Reset Form
            setFormData({
                title: '', description: '', topic: '', resources: '', startDate: '', targetDate: '',
                category: 'Development', difficulty: 'Beginner',
                steps: [{ title: '', resourceLink: '', estimatedTime: '' }]
            });
            setShowForm(false);
            fetchPlans();
        } catch (error) {
            alert("Failed to create plan");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePlan = (planId) => {
        setPlans(plans.filter(p => p.id !== planId));
    };

    if (loading) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="flex items-center justify-center min-h-[80vh]"><LoadingSpinner variant="page" /></div></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-blue-50/50">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-indigo-900">
                            Learning Roadmap
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Visualize your goals and track your journey.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${
                            showForm
                                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-indigo-500/30'
                        }`}
                    >
                        <span className="text-xl transition-transform duration-300 group-hover:rotate-90">{showForm ? '×' : '+'}</span>
                        {showForm ? 'Close Editor' : 'New Plan'}
                    </button>
                </div>

                {/* Animated Form Container */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? 'max-h-[2000px] opacity-100 mb-10' : 'max-h-0 opacity-0 mb-0'}`}>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">✎</span>
                            Draft New Plan
                        </h2>

                        <form onSubmit={handleCreate} className="space-y-8">

                            {/* SECTION 1: BASIC INFO */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Title</label>
                                    <input required type="text" placeholder="e.g. Master React Native" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                           value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                        <option>Development</option>
                                        <option>Design</option>
                                        <option>Business</option>
                                        <option>Marketing</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                            value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                                    <textarea rows="2" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none"
                                              placeholder="What are your main goals?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                            </div>

                            {/* SECTION 2: STEPS (THE MISSING PART) */}
                            <div className="border-t border-slate-100 pt-6">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 block">Roadmap Steps</label>

                                <div className="space-y-3">
                                    {formData.steps.map((step, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-200/60 transition-all hover:border-indigo-200 hover:shadow-sm">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 font-bold text-xs shrink-0 mt-1">
                                                {idx + 1}
                                            </div>

                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
                                                <div className="md:col-span-6">
                                                    <input type="text" placeholder="Step Title (e.g. Learn Variables)"
                                                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                                                           value={step.title} onChange={e => handleStepChange(idx, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="md:col-span-4">
                                                    <input type="text" placeholder="Resource URL (Optional)"
                                                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                                                           value={step.resourceLink} onChange={e => handleStepChange(idx, 'resourceLink', e.target.value)}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <input type="text" placeholder="Time (2h)"
                                                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                                                           value={step.estimatedTime} onChange={e => handleStepChange(idx, 'estimatedTime', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {formData.steps.length > 1 && (
                                                <button type="button" onClick={() => removeStep(idx)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button type="button" onClick={addStep} className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                                    <span className="text-lg">+</span> Add Another Step
                                </button>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button type="submit" disabled={submitting} className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">
                                    {submitting ? <LoadingSpinner variant="button" /> : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {plans.length === 0 ? (
                    <div className="text-center py-24 bg-white/50 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">🗺️</div>
                        <h3 className="text-2xl font-bold text-slate-800">Your roadmap is empty</h3>
                        <p className="text-slate-500 mt-2">Start your journey by creating your first plan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {plans.map(plan => (
                            <PlanCard key={plan.id} plan={plan} isOwner={true} onDelete={handleDeletePlan} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LearningPlans;