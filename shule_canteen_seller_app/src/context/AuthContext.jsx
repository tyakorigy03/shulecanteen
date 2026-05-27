// canteen/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const STORAGE_PREFIX = 'canteen_'; // Add prefix for canteen

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [school, setSchool] = useState(null);
    const [token, setToken] = useState(localStorage.getItem(`${STORAGE_PREFIX}token`));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    axios.defaults.headers.common['x-auth-token'] = token;

                    const savedUser = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}user`));
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

            // Verify role for canteen
            const allowedRoles = ['canteen', 'manager', 'accountant', 'operator'];
            if (!allowedRoles.includes(userData.role.toLowerCase())) {
                return {
                    success: false,
                    message: 'Unauthorized. This account is not registered for canteen operations.'
                };
            }

            // Store in localStorage with prefix
            localStorage.setItem(`${STORAGE_PREFIX}token`, token);
            localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(userData));

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

    useEffect(() => {
        const fetchSchoolProfile = async () => {
            if (user && user.schoolCode) {
                try {
                    const snap = await getDoc(
                        doc(db, 'schools', user.schoolCode, 'data', 'students_manifest')
                    );

                    if (snap.exists()) {
                        const data = snap.data();
                        if (data.school) {
                            setSchool(data.school);
                        } else {
                            setSchool(null);
                        }
                    } else {
                        setSchool(null);
                    }
                } catch (err) {
                    console.error("Error fetching school profile:", err);
                    setSchool(null);
                }
            } else {
                setSchool(null);
            }
        };

        fetchSchoolProfile();
    }, [user]);

    const logout = () => {
        localStorage.removeItem(`${STORAGE_PREFIX}token`);
        localStorage.removeItem(`${STORAGE_PREFIX}user`);
        delete axios.defaults.headers.common['x-auth-token'];
        setToken(null);
        setUser(null);
        setSchool(null);
    };

    const value = {
        user,
        school,
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