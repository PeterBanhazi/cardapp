import { useEffect } from 'react';
import { LoggedOutView } from './home';
import { logout } from '../utils/auth';

interface VisibilityProps {
    isVisible?: boolean;
    user?: {
        user_id: any;
        username: any;
    };
}

const Logout: React.FC<VisibilityProps> = ({ isVisible = true }) => {
    useEffect(() => {
        logout();
    }, []);

    return (
        <div style={{ display: isVisible ? 'block' : 'none' }}>
            <LoggedOutView title="You have been logged out" />
        </div>
    );
};

export default Logout;
