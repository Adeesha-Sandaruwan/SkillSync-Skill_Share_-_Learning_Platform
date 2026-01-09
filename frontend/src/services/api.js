import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// REMOVED default 'Content-Type': 'application/json'
// Axios will automatically set 'application/json' for objects
// And 'multipart/form-data' for FormData
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

export default api;