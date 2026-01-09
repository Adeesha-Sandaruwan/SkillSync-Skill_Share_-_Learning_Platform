import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const CreatePlan = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [steps, setSteps] = useState([{ title: '', resourceLink: '', estimatedTime: '' }]);

    const addStep = () => {
        setSteps([...steps, { title: '', resourceLink: '', estimatedTime: '' }]);
    };

    const removeStep = (index) => {
        if (steps.length === 1) return;
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || steps.some(s => !s.title.trim())) {
            alert("Please fill in the plan title and all step titles.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title,
                description,
                difficulty,
                category: 'General', // Can expand later
                targetDate: new Date().toISOString().split('T')[0], // Default today
                steps
            };

            await api.post(`/users/${user.id}/plans`, payload);
            navigate(`/profile/${user.id}`);
        } catch (error) {
            console.error("Failed to create plan", error);
            alert("Failed to create plan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                    <h1 className="text-2xl font-black text-slate-800 mb-6">Create New Roadmap</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                                    placeholder="e.g. Master Python in 30 Days"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600 resize-none"
                                    rows="3"
                                    placeholder="What will you learn?"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Difficulty</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600"
                                    value={difficulty}
                                    onChange={e => setDifficulty(e.target.value)}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        {/* Steps Builder */}
                        <div className="border-t border-slate-100 pt-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Roadmap Steps</h2>
                            <div className="space-y-4">
                                {steps.map((step, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl"></div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Step {idx + 1}</span>
                                            {steps.length > 1 && (
                                                <button type="button" onClick={() => removeStep(idx)} className="text-slate-300 hover:text-red-500">✕</button>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Step Title (e.g. Learn Variables)"
                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none text-sm font-bold"
                                                value={step.title}
                                                onChange={e => handleStepChange(idx, 'title', e.target.value)}
                                            />
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Resource Link (Optional)"
                                                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none text-sm"
                                                    value={step.resourceLink}
                                                    onChange={e => handleStepChange(idx, 'resourceLink', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Time (e.g. 2h)"
                                                    className="w-24 p-2 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none text-sm"
                                                    value={step.estimatedTime}
                                                    onChange={e => handleStepChange(idx, 'estimatedTime', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addStep}
                                className="mt-4 w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-500 font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                            >
                                + Add Another Step
                            </button>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                            >
                                {loading ? 'Creating...' : 'Create Roadmap'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreatePlan;