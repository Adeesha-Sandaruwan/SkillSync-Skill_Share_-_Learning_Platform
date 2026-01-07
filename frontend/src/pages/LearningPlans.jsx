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

    const [formData, setFormData] = useState({
        title: '', description: '', topic: '', resources: '', startDate: '', targetDate: ''
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

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/users/${user.id}/plans`, formData);
            setFormData({ title: '', description: '', topic: '', resources: '', startDate: '', targetDate: '' });
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
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? 'max-h-[800px] opacity-100 mb-10' : 'max-h-0 opacity-0 mb-0'}`}>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">✎</span>
                            Draft New Plan
                        </h2>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Title</label>
                                <input required type="text" placeholder="e.g. Master React Native" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                       value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Topic</label>
                                <input type="text" placeholder="e.g. Mobile Dev" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                       value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resources URL</label>
                                <input type="text" placeholder="e.g. udemy.com/course..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                       value={formData.resources} onChange={e => setFormData({...formData, resources: e.target.value})} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                                <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-600"
                                       value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Date</label>
                                <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-600"
                                       value={formData.targetDate} onChange={e => setFormData({...formData, targetDate: e.target.value})} />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                                <textarea rows="3" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none"
                                          placeholder="What are your main goals?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>

                            <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
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