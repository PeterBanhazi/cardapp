import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

import React from 'react';

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
    return (
        <div className="flex gap-3 items-center text-right">
            <h1 className="hidden lg:text-sm xl:text-lg lg:block">{user}</h1>
            <HomeButton linkto="/private" text="Settings" />
            <HomeButton linkto="/logout" text="Logout" />
        </div>
    );
};

export const LoggedOutView = ({ title = 'Welcome' }) => {
    return (
        <div className="flex gap-3 items-center text-right">
            <h1 className="hidden lg:block">{title}</h1>
            <HomeButton linkto="/login" text="Login" />
            <HomeButton linkto="/register" text="Register" />
        </div>
    );
};

export default Home;
