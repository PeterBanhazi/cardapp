import { useEffect } from 'react';
import Landing from '../../pages/Landing';
import { useNotifications } from '../../components/ui/notifications';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface VisibilityProps {
    isVisible?: boolean;
}

const Logout: React.FC<VisibilityProps> = ({ isVisible = false }) => {
    const { logout, isLoading, error } = useAuthStore();
    const navigate = useNavigate();
    useEffect(() => {
        logout();
        navigate('/');
        useNotifications.getState().addNotification({
            type: 'warning',
            title: 'Info',
            message: 'You have been successfully logged out!',
        });
    }, []);

    return (
        <div>
            <div style={{ display: isVisible ? 'block' : 'none' }}></div>
        </div>
    );
};

export default Logout;
