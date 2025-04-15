import { useEffect, useState, useRef } from 'react';

import {
    Button,
    Checkbox,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    TextInput,
    ThemeProvider,
} from 'flowbite-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { login } from '../../utils/auth';
import ModalOpenTriggerButton from './ModalOpenTriggerButton';
import { customTheme } from '../../utils/formThemes';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    const [openModal, setOpenModal] = useState(false);

    const usernameInputRef = useRef(null);

    useEffect(() => {
        if (isLoggedIn()) {
            navigate('/');
        }
        if (location.pathname === '/login') setOpenModal(true);
    }, []);

    const resetForm = () => {
        setUsername('');
        setPassword('');
    };

    const handleLogin = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        const { error } = await login(username, password);
        if (error) {
            alert(error);
        } else {
            navigate('/');
            resetForm();
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
                        // navigate('/');
                    }}
                    initialFocus={usernameInputRef}
                >
                    <ModalHeader>
                        <h3 className="text-xl font-medium text-gray-900 pl-4">
                            Sign in to your account
                        </h3>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-6">
                            <form onSubmit={handleLogin}>
                                <div>
                                    <div className="mb-1 block">
                                        <Label htmlFor="username">
                                            Your username
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
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
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
                                        color="tennisprimary"
                                        className="mt-2"
                                    >
                                        Log in to your account
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
