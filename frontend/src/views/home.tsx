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
        <div className="flex gap-3">
            <h1 className="font-semibold text-2xl">Welcome {user?.username}</h1>
            <Link to="/private">
                <Button>Private</Button>
            </Link>
            <Link to="/logout">
                <Button>Logout</Button>
            </Link>
        </div>
    );
};

export const LoggedOutView = ({ title = 'Home' }) => {
    return (
        <div className="flex gap-3">
            <h1>{title}</h1>
            <Link to="/login">
                <Button>Login</Button>
            </Link>
            <Link to="/register">
                <Button>Register</Button>
            </Link>
        </div>
    );
};

export default Home;
