import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../core/store/useAuthStore';

import React from 'react';

import Register from '../features/auth/register';
import ModalOpenTriggerButton from '../features/auth/ModalOpenTriggerButton';
import ProfileEditModal from '../features/auth/ProfileEditModal';
import Login from '../features/auth/login';

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
    const navigate = useNavigate();
    return (
        <div className="flex gap-3 items-center text-right">
            <h1 className="hidden lg:text-sm xl:text-lg lg:block">
                {username}
            </h1>
            <ProfileEditModal />
            <ModalOpenTriggerButton
                linkTo="/logout"
                buttonText="Logout"
                onClick={() => navigate('/logout')}
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
