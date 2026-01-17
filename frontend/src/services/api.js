import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- 1. REQUEST INTERCEPTOR: Attach Token ---
api.interceptors.request.use((config) => {
    // Check for token in specific storage first (Best Practice), then fallback to user object
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
}, (error) => {
    return Promise.reject(error);
});

// --- 2. RESPONSE INTERCEPTOR: Auto-Logout on 401/403 ---
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        // If Backend says "Unauthorized" (User not found/Token invalid)
        if (status === 401 || status === 403) {
            // Only redirect if we are NOT already on public pages (login/register/landing)
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
                console.warn("Session expired or invalid token detected. Logging out.");

                // 1. Nuke the stale data
                localStorage.removeItem('user');
                localStorage.removeItem('token');

                // 2. Redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// --- SPECIFIC API CALLS ---

export const getPublicPlans = async (query = '', difficulty = 'All', category = 'All') => {
    // Manually building string to ensure 'All' is handled correctly by backend defaults
    let url = `/plans/public?difficulty=${difficulty}&category=${category}`;
    if (query) {
        url += `&q=${encodeURIComponent(query)}`;
    }
    return await api.get(url);
};

export default api;