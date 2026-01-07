import { useState } from 'react';
import api from '../services/api';
import AuthContext from './authContext.js';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return null;

        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.token) return parsedUser;
        } catch {
            // ignore
        }

        localStorage.removeItem('user');
        return null;
    });

    const [loading] = useState(false);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });

            const userData = { ...response.data.user, token: response.data.token };

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
            return response.data;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};