import { useState } from 'react';
import api from '../services/api';

const AddPortfolioModal = ({ userId, type, onClose, onSuccess }) => {
    const [form, setForm] = useState({ title: '', company: '', description: '', years: '', name: '', issuer: '', date: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/portfolio/${userId}/${type}`, form);
            onSuccess();
            onClose();
        } catch (error) { alert("Failed"); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 capitalize">Add {type}</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {type === 'experience' && (
                        <>
                            <input placeholder="Job Title" className="w-full p-2 border rounded" onChange={e=>setForm({...form, title: e.target.value})} required/>
                            <input placeholder="Company" className="w-full p-2 border rounded" onChange={e=>setForm({...form, company: e.target.value})} required/>
                            <input placeholder="Years (e.g. 2023-Present)" className="w-full p-2 border rounded" onChange={e=>setForm({...form, years: e.target.value})} required/>
                            <textarea placeholder="Description" className="w-full p-2 border rounded" rows="3" onChange={e=>setForm({...form, description: e.target.value})} required/>
                        </>
                    )}
                    {type === 'certificate' && (
                        <>
                            <input placeholder="Certificate Name" className="w-full p-2 border rounded" onChange={e=>setForm({...form, name: e.target.value})} required/>
                            <input placeholder="Issuer" className="w-full p-2 border rounded" onChange={e=>setForm({...form, issuer: e.target.value})} required/>
                            <input placeholder="Date (e.g. Jan 2025)" className="w-full p-2 border rounded" onChange={e=>setForm({...form, date: e.target.value})} required/>
                        </>
                    )}
                    {type === 'skill' && (
                        <input placeholder="Skill Name (e.g. Java)" className="w-full p-2 border rounded" onChange={e=>setForm({...form, name: e.target.value})} required/>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500">Cancel</button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">{loading ? 'Saving...' : 'Add'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddPortfolioModal;