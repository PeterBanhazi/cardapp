import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const MainAuthWrapper = ({ children }) => {
    const { initAuth, isInitialized, isLoading } = useAuthStore();

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return <>{!isInitialized ? null : children}</>;
};

export default MainAuthWrapper;
