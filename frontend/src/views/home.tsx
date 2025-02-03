import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Button } from 'flowbite-react';

interface VisibilityProps {
    isVisible?: boolean;
    user?: {
        user_id: any;
        username: any;
    };
}
const Home: React.FC<VisibilityProps> = ({ isVisible = true }) => {
    const [isLoggedIn, user] = useAuthStore((state) => [
        state.isLoggedIn,
        state.user,
    ]);
    return (
        <div style={{ display: isVisible ? 'block' : 'none' }}>
            <div>
                {isLoggedIn() ? (
                    <LoggedInView user={user()} />
                ) : (
                    <LoggedOutView />
                )}
            </div>
        </div>
    );
};

const LoggedInView: React.FC<VisibilityProps> = ({ user }) => {
    return (
        <div className="flex gap-3 items-center h-16 text-right">
            <h1 className="hidden lg:text-sm xl:text-lg font-semibold text-orange-900 lg:block">
                {user?.username}
            </h1>
            <Link to="/private">
                <button className="bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Private
                </button>
            </Link>
            <Link to="/logout">
                <button className="bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Logout
                </button>
            </Link>
        </div>
    );
};

export const LoggedOutView = ({ title = 'Welcome' }) => {
    return (
        <div className="flex gap-3 items-center h-16 text-right">
            <h1 className="hidden lg:block">{title}</h1>
            <Link to="/login">
                <button className="bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Login
                </button>
            </Link>
            <Link to="/register">
                <button className="bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Register
                </button>
            </Link>
        </div>
    );
};

export default Home;
