import axios from 'axios';

// --- AUTOMATIC URL SWITCHING ---
// If VITE_API_URL is set (in Vercel), use it. Otherwise use localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- 1. REQUEST INTERCEPTOR ---
api.interceptors.request.use((config) => {
    let token = localStorage.getItem('token');
    if (!token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.token) token = user.token;
            } catch (e) {
                console.error("Error parsing user token", e);
            }
        }
    }
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// --- 2. RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;
        if (status === 401 || status === 403) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// --- SPECIFIC API CALLS ---
export const getPublicPlans = async (query = '', difficulty = 'All', category = 'All') => {
    let url = `/plans/public?difficulty=${difficulty}&category=${category}`;
    if (query) url += `&q=${encodeURIComponent(query)}`;
    return await api.get(url);
};

export default api;