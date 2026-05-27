import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-navblue flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
