import { useState, useEffect } from 'react';
import api from '../services/api';
import AuthContext from './authContext.js';

export const AuthProvider = ({ children }) => {

    const normalizeUser = (data) => {
        if (!data) return null;

        // Handle nested structure: { user: {...}, token: "..." } vs just {...}
        let userObj = data.user ? { ...data.user } : { ...data };

        // Ensure token is preserved if it exists in the root of the data
        if (data.token) userObj.token = data.token;

        // CRITICAL FIX: Ensure 'id' is always present.
        // Backend JIT/Google flow often returns 'id', while legacy might use 'userId'
        if (userObj.userId && !userObj.id) {
            userObj.id = userObj.userId;
        } else if (userObj.id && !userObj.userId) {
            userObj.userId = userObj.id;
        }

        return userObj;
    };

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return null;
        try {
            const parsed = JSON.parse(storedUser);
            return normalizeUser(parsed); // Re-normalize on load for consistency
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });

    const [loading, setLoading] = useState(false);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const userData = normalizeUser(response.data);

            if (userData.token) {
                localStorage.setItem('token', userData.token);
            }

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await api.post('/auth/register', { username, email, password });
            return normalizeUser(response.data);
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        // Industry best practice: Force a hard reload to clear all states
        window.location.href = '/login';
    };

    const setAuth = (data) => {
        const userData = normalizeUser(data);
        localStorage.setItem('user', JSON.stringify(userData));

        // If a new token comes with the data, update it
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }

        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setAuth, normalizeUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};