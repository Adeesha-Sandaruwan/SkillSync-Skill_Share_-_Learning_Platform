import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a "Interceptor" to attach the Token to every request if user is logged in
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));

    // FIX 1: Check for 'token', not 'auth' (unless you specifically renamed it)
    if (user && user.token) {
        // FIX 2: You MUST add "Bearer " before the token, or Java will reject it.
        config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;