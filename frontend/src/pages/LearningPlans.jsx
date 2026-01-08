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

    // Form State including STEPS
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Development',
        difficulty: 'Beginner',
        steps: [{ title: '', estimatedTime: '', resourceLink: '' }] // Start with 1 empty step
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

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    // Step Logic
    const addStep = () => {
        setFormData(p => ({ ...p, steps: [...p.steps, { title: '', estimatedTime: '', resourceLink: '' }] }));
    };

    const removeStep = (index) => {
        setFormData(p => ({ ...p, steps: p.steps.filter((_, i) => i !== index) }));
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...formData.steps];
        newSteps[index][field] = value;
        setFormData(p => ({ ...p, steps: newSteps }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Filter out empty steps
            const payload = {
                ...formData,
                steps: formData.steps.filter(s => s.title.trim() !== '')
            };

            await api.post(`/users/${user.id}/plans`, payload);

            // Reset Form
            setShowForm(false);
            setFormData({
                title: '', description: '', category: 'Development', difficulty: 'Beginner',
                steps: [{ title: '', estimatedTime: '', resourceLink: '' }]
            });
            fetchPlans();
        } catch (error) {
            alert("Failed to create plan");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePlan = (id) => setPlans(plans.filter(p => p.id !== id));

    if (loading) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="flex justify-center pt-20"><LoadingSpinner variant="page" /></div></div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800">Learning Roadmaps</h1>
                        <p className="text-slate-500 mt-1">Visualize your goals and track your progress.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all ${showForm ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        {showForm ? 'Cancel' : '+ New Plan'}
                    </button>
                </div>

                {/* CREATE FORM */}
                <div className={`transition-all overflow-hidden duration-300 ${showForm ? 'max-h-[1500px] mb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Draft New Roadmap</h2>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                                    <input required type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                           value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Master Spring Boot" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                                        <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
                                                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                            <option>Development</option><option>Design</option><option>Business</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Difficulty</label>
                                        <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
                                                value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                                            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <textarea className="w-full p-3 bg-slate-50 border rounded-xl outline-none resize-none" rows="2"
                                          value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What is the goal?" />
                            </div>

                            {/* STEPS INPUT SECTION */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <label className="block text-sm font-bold text-slate-700 uppercase mb-3">Roadmap Steps</label>
                                <div className="space-y-3">
                                    {formData.steps.map((step, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-slate-400 font-bold text-sm w-6">{idx+1}.</span>
                                                <input type="text" placeholder="Step Title" className="flex-1 p-2 text-sm border rounded-md outline-none focus:border-indigo-500"
                                                       value={step.title} onChange={e => handleStepChange(idx, 'title', e.target.value)} />
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="Link (Optional)" className="w-32 p-2 text-sm border rounded-md outline-none"
                                                       value={step.resourceLink} onChange={e => handleStepChange(idx, 'resourceLink', e.target.value)} />
                                                <input type="text" placeholder="Time" className="w-20 p-2 text-sm border rounded-md outline-none"
                                                       value={step.estimatedTime} onChange={e => handleStepChange(idx, 'estimatedTime', e.target.value)} />
                                                <button type="button" onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-600 px-2 font-bold">✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addStep} className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                    <span className="text-lg">+</span> Add Step
                                </button>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button disabled={submitting} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50">
                                    {submitting ? 'Creating...' : 'Publish Roadmap'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* PLAN GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <PlanCard key={plan.id} plan={plan} isOwner={true} onDelete={handleDeletePlan} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default LearningPlans;