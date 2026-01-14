import { useState } from 'react';
import api from '../services/api';
import AuthContext from './authContext.js';

export const AuthProvider = ({ children }) => {
    // Helper: Your backend sends 'userId', but frontend components often expect 'id'.
    // We fix this here so we don't have to change the backend.
    const normalizeUser = (data) => {
        if (!data) return null;
        // If data is wrapped in { user: ... }
        let userObj = data.user || data;

        // Ensure token is attached
        if (data.token) userObj.token = data.token;

        // CRITICAL FIX: Map userId to id so links like /profile/${user.id} work
        if (userObj.userId && !userObj.id) {
            userObj.id = userObj.userId;
        }

        return userObj;
    };

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return null;
        try {
            return JSON.parse(storedUser);
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });

    const [loading] = useState(false);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const userData = normalizeUser(response.data);

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
            // Register usually returns the same structure, so we normalize it too
            const userData = normalizeUser(response.data);
            return userData;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    // Fix for Profile Picture Update
    const setAuth = (data) => {
        const userData = normalizeUser(data);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setAuth, normalizeUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};