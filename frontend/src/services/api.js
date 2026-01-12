import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- UPDATED: SUPPORT SEARCH PARAMS ---
export const getPublicPlans = async (query = '', difficulty = 'All', category = 'All') => {
    // Manually building string to ensure 'All' is handled correctly by backend defaults
    let url = `/plans/public?difficulty=${difficulty}&category=${category}`;
    if (query) {
        url += `&q=${encodeURIComponent(query)}`;
    }
    return await api.get(url);
};

export default api;