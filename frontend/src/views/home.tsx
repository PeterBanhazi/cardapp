import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

import React, { useState } from 'react';
import ProfileEditModal from '../components/ProfileEditModal';
import Login from './login';
import Register from './register';
import ModalOpenTriggerButton from './ModalOpenTriggerButton';

const Home: React.FC = () => {
    const [user] = useAuthStore((state) => [state.user]);
    const loggedInUsername = user().username;

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
