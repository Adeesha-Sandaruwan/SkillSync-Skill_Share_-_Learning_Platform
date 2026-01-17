import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

// --- ICONS ---
const Icons = {
    Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Posts: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
    Logs: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
};

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState('dashboard'); // dashboard, users, posts, logs, admins
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [logs, setLogs] = useState([]);

    // Message User Modal State
    const [messageModal, setMessageModal] = useState({ open: false, userId: null, username: '' });
    const [msgContent, setMsgContent] = useState('');

    // New Admin State
    const [newAdmin, setNewAdmin] = useState({ firstname: '', lastname: '', username: '', email: '', password: '' });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [statsRes, usersRes, postsRes, logsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/posts'),
                api.get('/admin/logs')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setPosts(postsRes.data);
            setLogs(logsRes.data);
        } catch (error) {
            console.error("Failed to load admin data", error);
        }
    };

    const handleDeleteUser = async (id) => {
        if(window.confirm("Delete this user permanently?")) {
            await api.delete(`/admin/users/${id}`);
            fetchAllData();
        }
    };

    const handleDeletePost = async (id) => {
        if(window.confirm("Delete this post?")) {
            await api.delete(`/admin/posts/${id}`);
            fetchAllData();
        }
    };

    const handleSendMessage = async () => {
        try {
            await api.post(`/admin/users/${messageModal.userId}/contact`, { message: msgContent });
            alert("Message sent!");
            setMessageModal({ open: false, userId: null, username: '' });
            setMsgContent('');
        } catch (e) {
            alert("Failed to send");
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/create-admin', newAdmin);
            alert("Admin Created");
            setNewAdmin({ firstname: '', lastname: '', username: '', email: '', password: '' });
            fetchAllData();
        } catch (e) {
            alert("Error creating admin");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- SIDEBAR COMPONENT ---
    const SidebarItem = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setView(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}
        >
            <Icon /> {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-100 flex font-sans">

            {/* SIDEBAR */}
            <div className="w-64 bg-slate-50 border-r border-slate-200 p-6 flex flex-col justify-between fixed h-full z-20">
                <div>
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <h1 className="font-bold text-slate-800 text-lg">Admin Panel</h1>
                    </div>
                    <div className="space-y-2">
                        <SidebarItem id="dashboard" label="Overview" icon={Icons.Dashboard} />
                        <SidebarItem id="users" label="User Management" icon={Icons.Users} />
                        <SidebarItem id="posts" label="Post Management" icon={Icons.Posts} />
                        <SidebarItem id="logs" label="System Logs" icon={Icons.Logs} />
                        <SidebarItem id="admins" label="System Admins" icon={Icons.Users} />
                    </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold">
                    <Icons.Logout /> Logout
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 ml-64 p-8">

                {/* --- DASHBOARD OVERVIEW --- */}
                {view === 'dashboard' && (
                    <div className="animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">System Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <StatCard title="Total Users" value={stats.totalUsers} color="bg-blue-500" />
                            <StatCard title="Total Posts" value={stats.totalPosts} color="bg-emerald-500" />
                            <StatCard title="Learning Plans" value={stats.totalPlans} color="bg-purple-500" />
                            <StatCard title="System Health" value="100%" color="bg-green-500" />
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-700 mb-4">Quick Actions</h3>
                            <div className="flex gap-4">
                                <button onClick={() => setView('admins')} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100">Add New Admin</button>
                                <button onClick={fetchAllData} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold hover:bg-slate-100">Refresh Data</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- USERS TABLE --- */}
                {view === 'users' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg">User Management</h2>
                            <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500">{users.length} Users</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-bold">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="text-sm">
                                {users.map(u => (
                                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="p-4 flex items-center gap-3">
                                            <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}`} className="w-8 h-8 rounded-full" />
                                            <span className="font-bold text-slate-700">{u.username}</span>
                                        </td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>{u.role}</span></td>
                                        <td className="p-4 text-slate-500">{u.email}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => setMessageModal({ open: true, userId: u.id, username: u.username })}
                                                className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded font-bold"
                                            >
                                                Contact
                                            </button>
                                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded font-bold">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- POSTS TABLE --- */}
                {view === 'posts' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg">Post Management</h2>
                            <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500">{posts.length} Posts</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-6">
                            {posts.map(post => (
                                <div key={post.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                    <div className="flex gap-4">
                                        <img src={post.user?.avatarUrl} className="w-10 h-10 rounded-full bg-slate-200" />
                                        <div>
                                            <h4 className="font-bold text-slate-700">{post.user?.username}</h4>
                                            <p className="text-sm text-slate-600 mt-1">{post.description}</p>
                                            {post.imageUrl && <img src={post.imageUrl} className="mt-2 h-20 rounded-lg object-cover" />}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg font-bold text-xs">Delete Post</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- LOGS --- */}
                {view === 'logs' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in duration-300">
                        <h2 className="font-bold text-lg mb-4">System Activity Logs</h2>
                        <div className="space-y-3">
                            {logs.map((log, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                                    <span className={`w-2 h-2 rounded-full ${log.type === 'USER_REGISTER' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                    <span className="font-bold text-slate-700">{log.type}</span>
                                    <span className="text-slate-500 flex-1">{log.message}</span>
                                    <span className="text-xs text-slate-400">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- CREATE ADMIN --- */}
                {view === 'admins' && (
                    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Register New System Admin</h2>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="First Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" value={newAdmin.firstname} onChange={e => setNewAdmin({...newAdmin, firstname: e.target.value})} required />
                                <input type="text" placeholder="Last Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" value={newAdmin.lastname} onChange={e => setNewAdmin({...newAdmin, lastname: e.target.value})} required />
                            </div>
                            <input type="text" placeholder="Username" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} required />
                            <input type="email" placeholder="Email Address" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} required />
                            <input type="password" placeholder="Secure Password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} required />
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">Create Administrator</button>
                        </form>
                    </div>
                )}
            </div>

            {/* --- MESSAGE MODAL --- */}
            {messageModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-2">Message {messageModal.username}</h3>
                        <p className="text-sm text-slate-500 mb-4">This will be sent as a direct message from the System Admin.</p>
                        <textarea
                            className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-indigo-500 resize-none"
                            placeholder="Type your official message here..."
                            value={msgContent}
                            onChange={(e) => setMsgContent(e.target.value)}
                        />
                        <div className="flex gap-3 mt-4 justify-end">
                            <button onClick={() => setMessageModal({ open: false, userId: null })} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                            <button onClick={handleSendMessage} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Send Message</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 rounded-full -mr-10 -mt-10`}></div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
    </div>
);

export default AdminDashboard;