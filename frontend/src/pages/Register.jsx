import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (formData.username.length < 3) newErrors.username = 'Min 3 chars required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
        if (formData.password.length < 6) newErrors.password = 'Min 6 chars required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        if (!validate()) return;
        setIsLoading(true);
        try {
            await register(formData.username, formData.email, formData.password);
            navigate('/login');
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-violet-100 p-4">
            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 md:p-10 transform transition-all hover:shadow-indigo-200/50">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
                    <p className="mt-2 text-slate-500">Join the community today</p>
                </div>

                {apiError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">{apiError}</div>}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {['username', 'email', 'password'].map((field) => (
                        <div key={field}>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{field}</label>
                            <input
                                name={field}
                                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                                className={`w-full px-5 py-3.5 rounded-xl border font-medium outline-none transition-all ${
                                    errors[field]
                                        ? 'bg-red-50 border-red-200 text-red-700 focus:ring-red-200'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500'
                                }`}
                                placeholder={field === 'password' ? '••••••••' : field === 'email' ? 'you@example.com' : 'johndoe'}
                                value={formData[field]}
                                onChange={handleChange}
                            />
                            {errors[field] && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors[field]}</p>}
                        </div>
                    ))}

                    <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1 active:scale-95 mt-4 ${
                        isLoading ? 'bg-slate-400' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
                    }`}>
                        {isLoading ? <LoadingSpinner variant="button" /> : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800 underline decoration-2 underline-offset-4 decoration-indigo-200">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;