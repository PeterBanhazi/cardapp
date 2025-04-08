import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

import React, { useState, useMemo } from 'react';
import ProfileEditModal from '../components/ProfileEditModal';
import Login from './login';
import Register from './register';
import ModalOpenTriggerButton from './ModalOpenTriggerButton';

interface VisibilityProps {
    isVisible?: boolean;
    user?: string;
}
const Home: React.FC = () => {
    const [user] = useAuthStore((state) => [state.user]);
    const loggedInUsername = user().username;

    return (
        <div>
            <div>
                {loggedInUsername ? (
                    <LoggedInView user={loggedInUsername} />
                ) : (
                    <LoggedOutView />
                )}
            </div>
        </div>
    );
};

const HomeButton: React.FC<{ text: string; linkto: string }> = ({
    text,
    linkto,
}) => {
    return (
        <>
            <Link to={linkto}>
                <button className="bg-[#CA6702] text-stone-100 px-3 py-1 rounded-xl text-md font-medium hover:bg-orange-400 hover:cursor-pointer transition-colors">
                    <div className="-translate-y-[1px]">{text}</div>
                </button>
            </Link>
        </>
    );
};

const LoggedInView: React.FC<VisibilityProps> = ({ user }) => {
    const [isOpenProfileEditModal, setIsOpenProfileEditModal] = useState(false);

    return (
        <div className="flex gap-3 items-center text-right">
            <h1 className="hidden lg:text-sm xl:text-lg lg:block">{user}</h1>
            <ModalOpenTriggerButton
                buttonText="Settings"
                onClick={() => setIsOpenProfileEditModal((e) => !e)}
            />
            <ProfileEditModal triggerModalOpen={isOpenProfileEditModal} />

            {/* <button
                className="bg-[#CA6702] text-stone-100 px-3 py-1 rounded-xl text-md font-medium hover:bg-orange-400 hover:cursor-pointer transition-colors"
                onClick={() => setIsOpenProfileEditModal((e) => !e)}
            >
                <div className="-translate-y-[1px]">Settings</div>
            </button> */}
            <HomeButton linkto="/logout" text="Logout" />
        </div>
    );
};

const LoggedOutViewComponent = ({ title = 'Welcome' }) => {
    const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
    const [isOpenRegisterModal, setIsOpenRegisterModal] = useState(false);

    return (
        <div className="flex gap-3 items-center text-right">
            <h1 className="hidden lg:block">{title}</h1>
            <ModalOpenTriggerButton
                buttonText="Login"
                onClick={() => setIsOpenLoginModal((e) => !e)}
            />
            <ModalOpenTriggerButton
                buttonText="Register"
                onClick={() => setIsOpenRegisterModal((e) => !e)}
            />
            <div>
                <Login triggerModalOpen={isOpenLoginModal} />
                <Register triggerModalOpen={isOpenRegisterModal} />
            </div>
        </div>
    );
};
export const LoggedOutView = React.memo(LoggedOutViewComponent);

export default Home;

{
    /* <HomeButton linkto="/login" text="Login" /> */
}
{
    /* <HomeButton linkto="/register" text="Register" /> */
}
