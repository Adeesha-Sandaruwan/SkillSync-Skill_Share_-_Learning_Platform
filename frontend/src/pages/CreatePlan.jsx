import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const CreatePlan = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Development',
        difficulty: 'Beginner',
        tags: ''
    });

    const [steps, setSteps] = useState([
        { title: '', resourceUrl: '', duration: '' }
    ]);

    const handleAddStep = () => {
        setSteps([...steps, { title: '', resourceUrl: '', duration: '' }]);
    };

    const handleRemoveStep = (index) => {
        if (steps.length > 1) {
            setSteps(steps.filter((_, i) => i !== index));
        }
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || steps.some(s => !s.title)) {
            alert("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            // 1. Create the Plan
            const planRes = await api.post('/plans', {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim())
            });

            const planId = planRes.data.id;

            // 2. Add Steps to the Plan
            // (Assuming your backend supports adding multiple steps or we loop)
            await Promise.all(steps.map(step =>
                api.post(`/plans/${planId}/steps`, step)
            ));

            navigate(`/plans/${planId}`);
        } catch (error) {
            console.error("Failed to create plan", error);
            alert("Failed to create roadmap.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-800">Create Roadmap</h1>
                    <p className="text-slate-500">Share your path to mastery.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* --- BASIC INFO CARD --- */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">1. Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Roadmap Title</label>
                                <input
                                    required
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                    placeholder="e.g. Full Stack Java Developer 2026"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    required
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                                    placeholder="What will users learn?"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                <select
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                >
                                    <option>Development</option>
                                    <option>Design</option>
                                    <option>Business</option>
                                    <option>Marketing</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                                <select
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.difficulty}
                                    onChange={e => setFormData({...formData, difficulty: e.target.value})}
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tags (comma separated)</label>
                                <input
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="java, spring, react"
                                    value={formData.tags}
                                    onChange={e => setFormData({...formData, tags: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- CURRICULUM BUILDER --- */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                            <h3 className="font-bold text-lg text-slate-800">2. Curriculum Steps</h3>
                            <button type="button" onClick={handleAddStep} className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
                                + Add Step
                            </button>
                        </div>

                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="md:col-span-2">
                                            <input
                                                required
                                                placeholder="Step Title (e.g. Learn Variables)"
                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                                value={step.title}
                                                onChange={e => handleStepChange(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <input
                                            placeholder="Resource URL (Optional)"
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            value={step.resourceUrl}
                                            onChange={e => handleStepChange(index, 'resourceUrl', e.target.value)}
                                        />
                                        <input
                                            placeholder="Duration (e.g. 2 hours)"
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            value={step.duration}
                                            onChange={e => handleStepChange(index, 'duration', e.target.value)}
                                        />
                                    </div>
                                    {steps.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStep(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Publish Roadmap 🚀'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreatePlan;