import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/useAuthStore';

interface UseRegisterModalOptions {
    onClose?: () => void;
}

export function useRegisterModal({ onClose }: UseRegisterModalOptions = {}) {
    const [openModal, setOpenModal] = useState(false);
    const isLoggedIn = useAuthStore.getState().isAuthenticated;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/lobby');
            return;
        }
        if (location.pathname === '/register') setOpenModal(true);
    }, [isLoggedIn, navigate, location.pathname]);

    const handleClose = () => {
        onClose?.();
        setOpenModal(false);
    };

    return {
        openModal,
        setOpenModal,
        handleClose,
    };
}
