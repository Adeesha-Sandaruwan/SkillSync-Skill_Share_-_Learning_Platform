import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // --- HELPER: Normalize User Data ---
    // This ensures we always have 'id', 'userId', and 'role' correctly set
    const normalizeUser = (data) => {
        if (!data) return null;

        // Handle if data is wrapped in { user: ... } or flat
        let userObj = data.user ? { ...data.user } : { ...data };

        // Preserve token if it exists at root
        if (data.token) userObj.token = data.token;

        // Fix ID inconsistencies (id vs userId)
        if (userObj.userId && !userObj.id) {
            userObj.id = userObj.userId;
        } else if (userObj.id && !userObj.userId) {
            userObj.userId = userObj.id;
        }

        // Fix Role (Default to USER if missing)
        if (!userObj.role) {
            userObj.role = 'USER';
        }

        return userObj;
    };

    // --- STATE ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- INIT: Load from LocalStorage ---
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                const parsed = JSON.parse(storedUser);
                const normalized = normalizeUser(parsed);
                setUser(normalized);
            } catch (e) {
                console.error("Failed to parse user from storage", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // --- ACTIONS ---

    const login = async (username, password) => {
        try {
            const res = await api.post('/auth/login', { username, password });
            const userData = normalizeUser(res.data);

            if (userData.token) {
                localStorage.setItem('token', userData.token);
            }
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData; // Return for redirect logic
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await api.post('/auth/register', { username, email, password });
            // Note: Depending on your API, register might not return a token.
            // If it does, we can auto-login. If not, user goes to login page.
            return normalizeUser(res.data);
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/'; // Hard redirect to clear legacy states
    };

    // Helper to manually set auth (e.g. from Google Login)
    const setAuth = (data) => {
        const userData = normalizeUser(data);
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setAuth, normalizeUser }}>
            {/* Prevent rendering app until we check localStorage */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom Hook
export const useAuth = () => useContext(AuthContext);

export default AuthContext;