import { useEffect, useState } from 'react';
import { useAuthStore } from '../../core/store/useAuthStore';

const MainAuthWrapper = ({ children }: { children: React.ReactNode }) => {
    const { initAuth, isInitialized, isLoading } = useAuthStore();

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return <>{!isInitialized ? null : children}</>;
};

export default MainAuthWrapper;
