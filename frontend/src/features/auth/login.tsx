import { useEffect, useState, useRef } from 'react';

import {
    Button,
    Checkbox,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Spinner,
    TextInput,
    ThemeProvider,
} from 'flowbite-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../core/store/useAuthStore';

import ModalOpenTriggerButton from './ModalOpenTriggerButton';
import { customTheme } from '../../shared/formThemes';
import { useNotifications } from '../../shared/components/ui/notifications';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // ### loading(ok) and error handling for proper UX
    const { login, isLoading, error, clearError, isAuthenticated } =
        useAuthStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const isLoggedIn = useAuthStore.getState().isAuthenticated;

    const [openModal, setOpenModal] = useState(false);

    const usernameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/lobby');
        }
        if (location.pathname === '/login') setOpenModal(true);
        if (error && usernameInputRef.current) {
            usernameInputRef.current.focus();
        }
    }, [error, isLoggedIn, location]);

    const resetForm = () => {
        setUsername('');
        setPassword('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        await login(username, password);
        if (useAuthStore.getState().isAuthenticated) {
            navigate('/lobby');
            resetForm();
            useNotifications.getState().addNotification({
                type: 'success',
                title: 'Info',
                message: 'You have been successfully logged in!',
            });
        }
    };

    return (
        <>
            <ModalOpenTriggerButton
                buttonText="Login"
                onClick={() => setOpenModal(true)}
            />
            <ThemeProvider theme={customTheme}>
                <Modal
                    id="login-modal"
                    show={openModal}
                    size="md"
                    popup
                    position="top-center"
                    dismissible
                    onClose={() => {
                        setOpenModal(false);
                        resetForm();
                        // navigate('/');
                    }}
                    initialFocus={usernameInputRef}
                >
                    <ModalHeader className="text-xl font-medium text-gray-900 pl-4">
                        Sign in to your account
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-6">
                            <form onSubmit={handleLogin}>
                                <div>
                                    <div className="mb-1 block">
                                        <Label htmlFor="username">
                                            Your username
                                            {error && (
                                                <span className="pl-12 text-red-700">
                                                    Oops! Something doesn't
                                                    match...
                                                </span>
                                            )}
                                        </Label>
                                    </div>

                                    <TextInput
                                        id="username"
                                        placeholder=""
                                        type="text"
                                        name="username"
                                        autoComplete="username"
                                        color="tennisprimary"
                                        required
                                        value={username}
                                        ref={usernameInputRef}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            clearError();
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 block mt-2">
                                        <Label htmlFor="password">
                                            Your password
                                        </Label>
                                    </div>
                                    <TextInput
                                        type="password"
                                        id="password"
                                        name="password"
                                        color="tennisprimary"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            clearError();
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between py-1.5">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="remember" />
                                        <Label htmlFor="remember">
                                            Remember me
                                        </Label>
                                    </div>
                                    <a
                                        href="#"
                                        className="text-sm text-cyan-700 hover:underline dark:text-cyan-500"
                                    >
                                        Lost Password?
                                    </a>
                                </div>
                                <div className="w-full">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        color="tennisprimary"
                                        className="mt-2"
                                    >
                                        {isLoading && (
                                            <Spinner
                                                aria-label="Spinner for login button"
                                                size="md"
                                                className="fill-orange-500"
                                            />
                                        )}
                                        <span
                                            className={`${isLoading ? 'pl-3' : ''}`}
                                        >
                                            {isLoading
                                                ? 'Logging in ...'
                                                : 'Log in to your account'}
                                        </span>
                                    </Button>
                                </div>
                            </form>
                            <div className="flex justify-between text-sm font-medium  text-gray-500 dark:text-gray-300">
                                Not registered?&nbsp;
                                <a
                                    href="/register"
                                    className="text-cyan-700 hover:underline dark:text-cyan-500"
                                >
                                    Create account
                                </a>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
            </ThemeProvider>
        </>
    );
};

export default Login;
