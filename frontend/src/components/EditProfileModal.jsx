import { useState } from 'react';
import api from '../services/api'; // uses your configured axios instance
import LoadingSpinner from './LoadingSpinner';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        username: user.username || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
    });

    // Separate states for uploading image vs saving text
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // 1. INSTANT IMAGE UPLOAD (The Fix)
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        // Wrap the file in a FormData "envelope"
        const data = new FormData();
        data.append("file", file);

        try {
            // Send to your NEW Backend Endpoint
            const res = await api.post(`/users/${user.id}/avatar`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Server returns the short URL (e.g., http://localhost:8080/uploads/...)
            // Update the UI immediately to show the new picture
            setFormData(prev => ({ ...prev, avatarUrl: res.data }));

            // Also update the parent Profile page immediately so the big image changes
            onUpdate({ ...user, avatarUrl: res.data });

        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // 2. TEXT ONLY UPDATE
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // We ONLY send text here. The image is already uploaded/saved.
            const res = await api.put(`/users/${user.id}`, {
                username: formData.username,
                bio: formData.bio
            });
            onUpdate(res.data);
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-800">Edit Profile</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-28 h-28 mb-4 group cursor-pointer">
                        {/* Show the current avatarUrl (which updates instantly after upload) */}
                        <img
                            src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.username}&background=random`}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg group-hover:opacity-75 transition-all"
                        />

                        {/* Overlay text */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full font-bold">Change</span>
                        </div>

                        {/* The File Input */}
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                            disabled={uploading}
                        />

                        {/* Spinner while uploading */}
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                                <LoadingSpinner size="sm" />
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            rows="3"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-200"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;