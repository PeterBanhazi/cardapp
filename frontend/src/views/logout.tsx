import { useEffect } from 'react';
import { logout } from '../utils/auth';
import Landing from './Landing';
import { useNotifications } from '../components/ui/notifications';

interface VisibilityProps {
    isVisible?: boolean;
    user?: {
        user_id: any;
        username: any;
    };
}

const Logout: React.FC<VisibilityProps> = ({ isVisible = false }) => {
    useEffect(() => {
        logout();
    }, []);

    useNotifications.getState().addNotification({
        type: 'warning',
        title: 'Info',
        message: 'You have been successfully logged out!',
    });

    return (
        <div>
            <div style={{ display: isVisible ? 'block' : 'none' }}></div>
            <Landing />
        </div>
    );
};

export default Logout;
