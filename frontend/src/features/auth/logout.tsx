import { useEffect } from 'react';

import { useAuthStore } from '../../core/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../shared/components/ui/notifications';

interface VisibilityProps {
    isVisible?: boolean;
}

const Logout: React.FC<VisibilityProps> = ({ isVisible = false }) => {
    const { logout, isLoading, error } = useAuthStore();
    const navigate = useNavigate();
    useEffect(() => {
        const handler = async () => {
            await logout();
            useNotifications.getState().addNotification({
                type: 'warning',
                title: 'Info',
                message: 'You have been successfully logged out!',
            });
            navigate('/');
        };

        handler();
    }, [logout]);

    return (
        <div>
            <div style={{ display: isVisible ? 'block' : 'none' }}></div>
        </div>
    );
};

export default Logout;
