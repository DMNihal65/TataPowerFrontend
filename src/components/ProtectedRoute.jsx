import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (!token) {
        // Redirect to login if there's no token
        return <Navigate to="/tatapowerdoc" replace />;
    }

    // Check if user has the required role
    if (!allowedRoles.includes(userRole)) {
        // Redirect based on role
        switch (userRole) {
            case 'admin':
                return <Navigate to="/tatapowerdoc/admin" replace />;
            case 'user':
                return <Navigate to="/tatapowerdoc/user" replace />;
            case 'supervisor':
            case 'Data Management Associate':
                // These roles need plant selection from URL
                const plant = window.location.pathname.split('/')[2];
                if (!plant) {
                    return <Navigate to="/tatapowerdoc" replace />;
                }
                return <Navigate to={`/tatapowerdoc/${plant}/dashboard`} replace />;
            default:
                // Invalid role, logout
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                return <Navigate to="/tatapowerdoc" replace />;
        }
    }

    return children;
};

export default ProtectedRoute; 