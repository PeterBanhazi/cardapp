import { ReactNode } from 'react';
import { useAuthStore } from '../../core/store/useAuthStore';
import { Navigate } from 'react-router-dom';

export const PublicOnlyRoute: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated, isInitialized } = useAuthStore();

    // If auth is not initialized yet, show nothing (AuthProvider will handle loading state)
    if (!isInitialized) {
        return null;
    }

    // If authenticated, redirect to the specified route (e.g., dashboard)
    if (isAuthenticated) {
        return <Navigate to="/lobby" replace />;
    }

    // If not authenticated, render the children components
    return <>{children}</>;
};
