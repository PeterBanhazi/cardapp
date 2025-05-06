import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, refreshToken } = useAuthStore();
    const navigate = useNavigate();

    // If not authenticated, redirect to login
    useEffect(() => {
        const checkAuth = async () => {
            // If not authenticated, try to refresh the token
            if (!isAuthenticated) {
                const refreshed = await refreshToken();

                // If not authenticated and couldn't refresh, redirect to login
                if (!refreshed) {
                    return navigate('/login', { replace: true });
                }
            }
        };

        checkAuth();
    }, [isAuthenticated, refreshToken, navigate]);
    // Otherwise, render the children
    return <>{children}</>;
};

export default PrivateRoute;
