import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PlanCard from '../components/PlanCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const LearningPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        topic: '',
        resources: '',
        startDate: '',
        targetDate: ''
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get(`/users/${user.id}/plans`);
            setPlans(response.data);
        } catch (error) {
            console.error("Error fetching plans", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/users/${user.id}/plans`, formData);
            setFormData({ title: '', description: '', topic: '', resources: '', startDate: '', targetDate: '' });
            setShowForm(false);
            fetchPlans();
        } catch (error) {
            console.error("Error creating plan", error);
            alert("Failed to create plan");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePlan = (planId) => {
        setPlans(plans.filter(p => p.id !== planId));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <LoadingSpinner variant="page" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Learning Roadmap</h1>
                        <p className="text-gray-500 mt-1">Manage your goals and timelines</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        {showForm ? 'Cancel' : '+ New Plan'}
                    </button>
                </div>

                {/* Create Plan Form (Collapsible) */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-8 animate-fade-in-down">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Draft New Plan</h2>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Master Spring Boot"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Topic</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Backend Development"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.topic}
                                    onChange={e => setFormData({...formData, topic: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Resources (Links)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Udemy Course, Documentation"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.resources}
                                    onChange={e => setFormData({...formData, resources: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.startDate}
                                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Target Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.targetDate}
                                    onChange={e => setFormData({...formData, targetDate: e.target.value})}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Describe your learning goals..."
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="col-span-2 flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors"
                                >
                                    {submitting ? <LoadingSpinner variant="button" /> : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Plans Grid */}
                {plans.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🗺️</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No plans yet</h3>
                        <p className="text-gray-500 mt-2">Create your first learning roadmap to track your progress.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isOwner={true}
                                onDelete={handleDeletePlan}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LearningPlans;