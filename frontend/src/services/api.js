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
    if (user && user.auth) {
        config.auth = user.auth; // Using Basic Auth for now as per simple setup
    }
    return config;
});

export default api;