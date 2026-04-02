import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../core/store/useAuthStore';

import React from 'react';
import Register from '../features/auth/register';
import ModalOpenTriggerButton from '../features/auth/ModalOpenTriggerButton';
import ProfileEditModal from '../features/auth/ProfileEditModal';
import Login from '../features/auth/login';
import { useMutation } from '@tanstack/react-query';
import { useNotifications } from '@/shared/components/ui/notifications';
import { Username } from '@/shared/components/ui/UsernameWrapper';

const Home: React.FC = () => {
    const loggedInUsername = useAuthStore((state) => state.user?.username);

    return (
        <div>
            <div>
                {loggedInUsername ? (
                    <LoggedInView username={loggedInUsername} />
                ) : (
                    <LoggedOutView />
                )}
            </div>
        </div>
    );
};

const LoggedInView: React.FC<{ username: string }> = ({ username }) => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const logoutMutation = useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            useNotifications.getState().addNotification({
                type: 'warning',
                title: 'Info',
                message: 'You have been successfully logged out!',
            });
            navigate('/');
        },
    });
    return (
        <div className="flex gap-3 items-center text-right">
            <h1 className="hidden lg:text-sm xl:text-lg lg:block">
                <Username
                    username={username}
                    options={{
                        maxWidth: 180,
                        isClickable: false,
                        tooltipIsActive: true,
                        tooltipTheme: 'light',
                    }}
                />
            </h1>
            <ProfileEditModal />
            <ModalOpenTriggerButton
                linkTo="/logout"
                buttonText="Logout"
                onClick={() => logoutMutation.mutate()}
            />
        </div>
    );
};

const LoggedOutViewComponent = ({ title = 'Welcome' }) => {
    return (
        <div className="flex gap-3 items-center text-right">
            <h1 className="hidden lg:block">{title}</h1>
            <Login />
            <Register />
        </div>
    );
};
export const LoggedOutView = React.memo(LoggedOutViewComponent);

export default Home;
