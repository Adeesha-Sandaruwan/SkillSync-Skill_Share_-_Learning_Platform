import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, posts: 0, plans: 0 });
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [newAdmin, setNewAdmin] = useState({ firstname: '', lastname: '', username: '', email: '', password: '' });

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    const fetchStats = () => api.get('/admin/stats').then(res => setStats(res.data));
    const fetchUsers = () => api.get('/admin/users').then(res => setUsers(res.data));

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure?")) {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
            fetchStats();
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/create-admin', newAdmin);
            alert("New Admin Created!");
            setNewAdmin({ firstname: '', lastname: '', username: '', email: '', password: '' });
            fetchUsers();
        } catch (error) {
            alert("Failed. Username might exist.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
                <p className="text-slate-500 mb-8">System Overview & Management</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Users" value={stats.users} color="bg-blue-500" icon="👥" />
                    <StatCard title="Total Posts" value={stats.posts} color="bg-emerald-500" icon="📝" />
                    <StatCard title="Roadmaps" value={stats.plans} color="bg-indigo-500" icon="🗺️" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-200">
                        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Manage Users" />
                        <TabButton active={activeTab === 'createAdmin'} onClick={() => setActiveTab('createAdmin')} label="Add Admin" />
                    </div>

                    <div className="p-6">
                        {activeTab === 'users' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs text-slate-400 uppercase border-b bg-slate-50">
                                    <tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Email</th><th className="p-3 text-right">Action</th></tr>
                                    </thead>
                                    <tbody className="text-sm">
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b hover:bg-slate-50">
                                            <td className="p-3 font-bold flex items-center gap-2">
                                                <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}`} className="w-6 h-6 rounded-full" />
                                                {u.username}
                                            </td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                                            <td className="p-3 text-slate-500">{u.email}</td>
                                            <td className="p-3 text-right"><button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded font-bold">Delete</button></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'createAdmin' && (
                            <form onSubmit={handleCreateAdmin} className="max-w-md mx-auto space-y-4">
                                <h3 className="font-bold text-lg">Create New Admin</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="First Name" className="p-2 border rounded-lg w-full" value={newAdmin.firstname} onChange={e => setNewAdmin({...newAdmin, firstname: e.target.value})} required />
                                    <input type="text" placeholder="Last Name" className="p-2 border rounded-lg w-full" value={newAdmin.lastname} onChange={e => setNewAdmin({...newAdmin, lastname: e.target.value})} required />
                                </div>
                                <input type="text" placeholder="Username" className="p-2 border rounded-lg w-full" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} required />
                                <input type="email" placeholder="Email" className="p-2 border rounded-lg w-full" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} required />
                                <input type="password" placeholder="Password" className="p-2 border rounded-lg w-full" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} required />
                                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700">Create Admin</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white ${color} shadow-md`}>{icon}</div>
        <div><p className="text-slate-400 text-xs font-bold uppercase">{title}</p><p className="text-2xl font-black text-slate-800">{value}</p></div>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button onClick={onClick} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all ${active ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{label}</button>
);

export default AdminDashboard;