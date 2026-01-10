import { useState } from 'react';
import api from '../services/api';

const AddPortfolioModal = ({ userId, type, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        company: '', // Only for experience
        years: '',   // Only for experience
        skillName: '', // Only for skill
        level: 'Intermediate' // Only for skill
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mapping frontend form to likely backend endpoint structure
            // Assuming endpoint: POST /api/portfolio/{type}/{userId}
            await api.post(`/portfolio/${type}/${userId}`, formData);
            onSuccess();
            onClose();
        } catch (error) {
            alert(`Failed to add ${type}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 capitalize">Add {type}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {type === 'experience' ? (
                        <>
                            <input
                                required placeholder="Job Title / Role"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                            <input
                                required placeholder="Company / Organization"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                            />
                            <input
                                required placeholder="Years (e.g. 2020 - Present)"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                value={formData.years} onChange={e => setFormData({...formData, years: e.target.value})}
                            />
                        </>
                    ) : (
                        // For Skills/Certificates
                        <>
                            <input
                                required placeholder="Skill / Certificate Name"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} // Reusing 'title' field
                            />
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        {loading ? 'Adding...' : 'Add Item'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPortfolioModal;