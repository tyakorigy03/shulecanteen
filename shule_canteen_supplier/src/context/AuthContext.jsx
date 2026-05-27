// supplier/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const STORAGE_PREFIX = 'supplier_'; // Add prefix for supplier

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [supplier, setSupplier] = useState(null);
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

    // Fetch supplier profile when user changes
    useEffect(() => {
        const fetchSupplierProfile = async () => {
            if (user && user.supplierId) {
                try {
                    const supplierDoc = await getDoc(doc(db, 'suppliers', user.supplierId));
                    
                    if (supplierDoc.exists()) {
                        setSupplier({ id: supplierDoc.id, ...supplierDoc.data() });
                    } else {
                        const onboardingDoc = await getDoc(doc(db, 'onboarding_requests', user.supplierId));
                        if (onboardingDoc.exists()) {
                            setSupplier({ id: onboardingDoc.id, ...onboardingDoc.data() });
                        } else {
                            setSupplier(null);
                        }
                    }
                } catch (err) {
                    console.error("Error fetching supplier profile:", err);
                    setSupplier(null);
                }
            } else {
                setSupplier(null);
            }
        };

        fetchSupplierProfile();
    }, [user]);

    const login = async (phone, password) => {
        try {
            const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
            const res = await axios.post(`${API_BASE}/auth/login`, { phone, password });

            const { token, user } = res.data;

            // Verify role for supplier
            if (user.role !== 'supplier' && user.role !== 'supplier_admin' && user.role !== 'supplier_staff') {
                return {
                    success: false,
                    message: 'Unauthorized. This account is not registered as a supplier.'
                };
            }

            localStorage.setItem(`${STORAGE_PREFIX}token`, token);
            localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(user));

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

    const refreshSupplier = async () => {
        if (user && user.supplierId) {
            try {
                const supplierDoc = await getDoc(doc(db, 'onboarding_requests', user.supplierId));
                if (supplierDoc.exists()) {
                    setSupplier({ id: supplierDoc.id, ...supplierDoc.data() });
                }
            } catch (err) {
                console.error("Error refreshing supplier:", err);
            }
        }
    };

    const logout = () => {
        localStorage.removeItem(`${STORAGE_PREFIX}token`);
        localStorage.removeItem(`${STORAGE_PREFIX}user`);
        delete axios.defaults.headers.common['x-auth-token'];
        setToken(null);
        setUser(null);
        setSupplier(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            supplier,
            token,
            loading,
            login,
            logout,
            refreshSupplier,
            isAuthenticated: !!token
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);