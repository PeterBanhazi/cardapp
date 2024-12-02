import { useEffect, useState, useRef } from 'react';
import { login } from '../utils/auth';
import { Form, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Button, Checkbox, Label, Modal, TextInput } from 'flowbite-react';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    const [openModal, setOpenModal] = useState(true);
    // const usernameInputRef = useRef < HTMLInputElement > null;

    useEffect(() => {
        if (isLoggedIn()) {
            navigate('/');
        }
    }, []);

    const resetForm = () => {
        setUsername('');
        setPassword('');
    };

    const handleLogin = async (e) => {
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
            <Modal
                show={openModal}
                size="md"
                popup
                dismissible
                onClose={() => {
                    setOpenModal(false);
                    navigate('/');
                }}
                className="bg-opacity-75 py-14"
                // initialFocus={usernameInputRef}
            >
                <Modal.Header />
                <Modal.Body>
                    <div className="space-y-6">
                        <form onSubmit={handleLogin}>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                Sign in to your account
                            </h3>
                            <div>
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="username"
                                        value="Your username"
                                    />
                                </div>

                                <TextInput
                                    id="username"
                                    // ref={emailInputRef}
                                    placeholder=""
                                    required
                                    value={username}
                                    // ref={usernameInputRef}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="password"
                                        value="Your password"
                                    />
                                </div>
                                <TextInput
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex justify-between">
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
                                <Button type="submit">
                                    Log in to your account
                                </Button>
                            </div>
                        </form>
                        <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
                            Not registered?&nbsp;
                            <a
                                href="#"
                                className="text-cyan-700 hover:underline dark:text-cyan-500"
                            >
                                Create account
                            </a>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Login;
