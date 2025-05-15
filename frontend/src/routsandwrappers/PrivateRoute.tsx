import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, isInitialized } = useAuthStore();
    const navigate = useNavigate();

    // If not authenticated, redirect to login
    useEffect(() => {
        const checkAuth = async () => {
            if (!isInitialized) {
                return null;
            }
            // If not authenticated, try to refresh the token
            if (!isAuthenticated) {
                return navigate('/login', { replace: true });
            }
        };

        checkAuth();
    }, []);
    // Otherwise, render the children
    return <>{children}</>;
};

export default PrivateRoute;
