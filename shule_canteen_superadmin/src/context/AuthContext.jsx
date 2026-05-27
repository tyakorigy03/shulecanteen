import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    // Set default auth header for all axios requests
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

            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            axios.defaults.headers.common['x-auth-token'] = token;
            setToken(token);
            setUser(user);

            return { success: true };
        } catch (err) {
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

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
