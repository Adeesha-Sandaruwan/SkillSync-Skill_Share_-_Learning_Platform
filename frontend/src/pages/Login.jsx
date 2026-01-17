import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, setAuth, normalizeUser } = useAuth();
    const navigate = useNavigate();

    const parseJwt = (token) => {
        try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const userData = await login(formData.username, formData.password);

            // --- FIX: Redirect Logic ---
            if (userData.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/feed'); // <--- CHANGED FROM '/' TO '/feed'
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Invalid credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError('');
        try {
            const googleToken = credentialResponse.credential;
            const decoded = parseJwt(googleToken);
            if (!decoded) throw new Error("Failed to decode Google token");

            const res = await api.post('/auth/google', {
                email: decoded.email,
                displayName: decoded.name,
                photoUrl: decoded.picture,
                googleToken: googleToken
            });

            if (res.data.token) {
                const userData = normalizeUser ? normalizeUser(res.data) : res.data;
                if (userData.userId && !userData.id) userData.id = userData.userId;

                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));

                if (setAuth) {
                    setAuth(userData);
                    // --- FIX: Redirect Logic ---
                    if (userData.role === 'ADMIN') {
                        navigate('/admin');
                    } else {
                        navigate('/feed'); // <--- CHANGED FROM '/' TO '/feed'
                    }
                } else {
                    window.location.href = userData.role === 'ADMIN' ? '/admin' : '/feed';
                }
            }
        } catch (err) {
            console.error("Google Auth Error:", err);
            setError("Google Login Failed. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 p-4">
            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden transform transition-all hover:scale-[1.01]">
                <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="p-8 md:p-10">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">Welcome Back</h2>
                        <p className="mt-2 text-slate-500 font-medium">Continue your learning journey</p>
                    </div>
                    {error && (<div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2 animate-shake">⚠️ {error}</div>)}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group"><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">Username</label><input type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="Enter your username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required /></div>
                        <div className="group"><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">Password</label><input type="password" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></div>
                        <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1 active:scale-95 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>{isLoading ? <LoadingSpinner variant="button" /> : 'Sign In'}</button>
                    </form>
                    <div className="mt-8">
                        <div className="relative mb-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white/0 text-slate-400 font-medium bg-white">Or continue with</span></div></div>
                        <div className="flex justify-center"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google Login Failed")} theme="filled_blue" shape="pill" text="continue_with" width="320" /></div>
                    </div>
                    <div className="mt-8 text-center"><p className="text-slate-500 text-sm">New to SkillSync?{' '}<Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-2 underline-offset-4 decoration-indigo-200 hover:decoration-indigo-600">Create Account</Link></p></div>
                </div>
            </div>
        </div>
    );
};

export default Login;