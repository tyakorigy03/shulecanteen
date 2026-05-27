import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Dynamic API Base for Driver App
    const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    // Set default auth header
                    axios.defaults.headers.common['x-auth-token'] = token;

                    const savedUser = JSON.parse(localStorage.getItem('user'));
                    if (savedUser) {
                        setUser(savedUser);
                    }
                } catch (err) {
                    console.error('Failed to restore auth session:', err);
                    logout();
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (phone, password) => {
        try {
            const res = await axios.post(`${API_BASE}/auth/login`, { phone, password });

            const { token, user: userData } = res.data;

            // Verify role
            if (userData.role !== 'driver') {
                return {
                    success: false,
                    message: 'Unauthorized. This account is not registered as a driver.'
                };
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            axios.defaults.headers.common['x-auth-token'] = token;
            setToken(token);
            setUser(userData);

            return { success: true };
        } catch (err) {
            console.error("Login Error:", err);
            return {
                success: false,
                message: err.response?.data?.message || 'Login failed. Please check your credentials.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['x-auth-token'];
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
