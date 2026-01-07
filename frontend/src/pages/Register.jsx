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
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

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
            setApiError(err.response?.data?.message || 'Registration failed. Try a different username/email.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform transition-all hover:shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🚀</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-500">Join the professional learning network</p>
                </div>

                {apiError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fade-in">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-medium">{apiError}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                            <input
                                name="username"
                                type="text"
                                className={`w-full px-4 py-3 rounded-lg border ${errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            {errors.username && <p className="mt-1 text-xs text-red-500 font-medium">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${
                                isLoading
                                    ? 'bg-indigo-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30'
                            }`}
                        >
                            {isLoading ? <LoadingSpinner variant="button" /> : 'Create Account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;