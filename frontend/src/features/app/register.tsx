import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
    Button,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Spinner,
    TextInput,
    ThemeProvider,
} from 'flowbite-react';
import { customTheme } from '../../utils/formThemes';
import ModalOpenTriggerButton from './ModalOpenTriggerButton';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const isLoggedIn = useAuthStore.getState().isAuthenticated;
    const navigate = useNavigate();
    const location = useLocation();
    const { register, error, clearError, isLoading } = useAuthStore();

    const [openModal, setOpenModal] = useState(false);
    const usernameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/lobby');
        } else if (location.pathname === '/register') setOpenModal(true);
        if (error && usernameInputRef.current) {
            usernameInputRef.current.focus();
        }
    }, [error, navigate, location]);

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setPassword2('');
        setEmail('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await register(username, password, password2, email);

        resetForm();
    };

    return (
        <>
            <ModalOpenTriggerButton
                buttonText="Register"
                onClick={() => setOpenModal(true)}
            />
            <div className="">
                <ThemeProvider theme={customTheme}>
                    <Modal
                        id="register-modal"
                        title="Login field"
                        show={openModal}
                        size="md"
                        popup
                        position="top-center"
                        dismissible
                        onClose={() => {
                            setOpenModal(false);
                            resetForm();
                            clearError();
                        }}
                        initialFocus={usernameInputRef}
                    >
                        <ModalHeader className="text-xl font-medium text-gray-900 pl-4">
                            Sign up to our platform
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-6">
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <div className="mb-1 block">
                                            <Label htmlFor="username">
                                                Your username
                                                {error && (
                                                    <span className="pl-12 text-red-700">
                                                        Oops! Username might be
                                                        taken.
                                                    </span>
                                                )}
                                            </Label>
                                        </div>
                                        <TextInput
                                            ref={usernameInputRef}
                                            type="text"
                                            id="username"
                                            autoComplete="username"
                                            maxLength={20}
                                            onChange={(e) => {
                                                setUsername(e.target.value);
                                                clearError();
                                            }}
                                            placeholder="Username (max 20 characters)"
                                            required
                                            color="tennisprimary"
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
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                clearError();
                                            }}
                                            placeholder="Password"
                                            autoComplete="new-password"
                                            required
                                            color="tennisprimary"
                                        />
                                    </div>
                                    <div>
                                        <div className="mb-1 block mt-2">
                                            <Label htmlFor="confirm-password">
                                                Repeat password
                                            </Label>
                                        </div>
                                        <TextInput
                                            type="password"
                                            id="confirm-password"
                                            autoComplete="new-password"
                                            onChange={(e) => {
                                                setPassword2(e.target.value);
                                                clearError();
                                            }}
                                            placeholder="Confirm Password"
                                            required
                                            color="tennisprimary"
                                        />
                                    </div>
                                    <div className="mb-1 block mt-2">
                                        <Label htmlFor="email">Email </Label>
                                    </div>
                                    <TextInput
                                        type="email"
                                        id="email"
                                        autoComplete="username"
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="email@example.com"
                                        required
                                        color="tennisprimary"
                                    />

                                    <p className="text-red-600">
                                        {password2 !== password
                                            ? 'Passwords do not match'
                                            : ''}
                                    </p>
                                    <div className="w-full pt-2">
                                        {error && (
                                            <div className="pl-1">
                                                <Label className="text-red-700">
                                                    Passwords must be at least 8
                                                    characters long and must
                                                    contain capital letters
                                                    also. Email must be unique!
                                                    <br />
                                                    Please try again.
                                                </Label>
                                            </div>
                                        )}
                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                color="tennisprimary"
                                            >
                                                {isLoading && (
                                                    <Spinner
                                                        aria-label="Spinner for login button"
                                                        size="md"
                                                        className="fill-orange-500"
                                                    />
                                                )}
                                                <span
                                                    className={`${isLoading ? 'pl-2' : ''}`}
                                                >
                                                    {isLoading
                                                        ? 'Creating account...'
                                                        : 'Create new account'}
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </ModalBody>
                    </Modal>
                </ThemeProvider>
            </div>
        </>
    );
};

export default Register;
