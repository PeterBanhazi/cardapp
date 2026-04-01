import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
    Button,
    Checkbox,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Spinner,
    TextInput,
} from 'flowbite-react';
import { useAuthStore } from '../../core/store/useAuthStore';
import ModalOpenTriggerButton from './ModalOpenTriggerButton';

import { useNotifications } from '../../shared/components/ui/notifications';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { login, error, clearError } = useAuthStore();
    const isLoggedIn = useAuthStore.getState().isAuthenticated;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [openModal, setOpenModal] = useState(false);

    const usernameInputRef = useRef<HTMLInputElement>(null);

    // Stable IDs for aria-describedby associations
    const formErrorId = useId();
    const usernameErrorId = useId();

    // ── Side-effects ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/lobby');
            return;
        }
        if (location.pathname === '/login') setOpenModal(true);
    }, [isLoggedIn, navigate, location.pathname]);

    useEffect(() => {
        if (error && usernameInputRef.current) {
            usernameInputRef.current.focus();
        }
    }, [error]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const resetForm = () => {
        setUsername('');
        setPassword('');
    };

    const handleClose = () => {
        setOpenModal(false);
        resetForm();
        clearError();
    };

    // ── TanStack mutation ─────────────────────────────────────────────────────
    const loginMutation = useMutation({
        mutationFn: () => login(username, password),
        onSuccess: () => {
            // login() sets isAuthenticated synchronously via set() before
            // this callback fires, so getState() is already up to date.
            if (useAuthStore.getState().isAuthenticated) {
                navigate('/lobby');
                resetForm();
                useNotifications.getState().addNotification({
                    type: 'success',
                    title: 'Welcome back!',
                    message: 'You have been successfully logged in.',
                });
            }
        },
        onError: () => {
            usernameInputRef.current?.focus();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginMutation.isPending) return;
        loginMutation.mutate();
    };

    const isLoading = loginMutation.isPending;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <ModalOpenTriggerButton
                buttonText="Login"
                onClick={() => setOpenModal(true)}
            />

            <Modal
                id="login-modal"
                show={openModal}
                size="md"
                popup
                position="top-center"
                dismissible
                onClose={handleClose}
                initialFocus={usernameInputRef}
                aria-labelledby="login-modal-title"
            >
                <ModalHeader
                    id="login-modal-title"
                    className="text-xl font-medium text-gray-900 pl-4"
                >
                    Sign in to your account
                </ModalHeader>

                <ModalBody>
                    {/* Live region — screen readers announce server errors */}
                    <div
                        id={formErrorId}
                        role="alert"
                        aria-live="polite"
                        aria-atomic="true"
                        className={error ? 'mb-3' : 'sr-only'}
                    >
                        {error && (
                            <p className="text-sm text-red-700 pl-1">
                                Username or password is incorrect. Please try
                                again.
                            </p>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        aria-describedby={error ? formErrorId : undefined}
                    >
                        {/* ── Username ── */}
                        <div className="mb-3">
                            <Label htmlFor="username" className="mb-1 block">
                                Your username
                                {error && (
                                    <span
                                        id={usernameErrorId}
                                        className="pl-3 text-red-700 text-sm"
                                        aria-live="polite"
                                    >
                                        Oops! Something doesn't match...
                                    </span>
                                )}
                            </Label>
                            <TextInput
                                ref={usernameInputRef}
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                color="tennisprimary"
                                required
                                value={username}
                                aria-required="true"
                                aria-invalid={!!error}
                                aria-describedby={
                                    error ? usernameErrorId : undefined
                                }
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    clearError();
                                }}
                            />
                        </div>

                        {/* ── Password ── */}
                        <div className="mb-3">
                            <Label htmlFor="password" className="mb-1 block">
                                Your password
                            </Label>
                            <TextInput
                                id="password"
                                name="password"
                                type="password"
                                color="tennisprimary"
                                autoComplete="current-password"
                                required
                                value={password}
                                aria-required="true"
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    clearError();
                                }}
                            />
                        </div>

                        {/* ── Remember me + Lost password ── */}
                        <div className="flex justify-between py-1.5">
                            <div className="flex items-center gap-2">
                                {/* Remember me is a UI placeholder — not wired to store */}
                                <Checkbox id="remember" />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>
                            <a
                                href="#"
                                className="text-sm text-cyan-700 hover:underline dark:text-cyan-500"
                                aria-label="Reset your lost password"
                            >
                                Lost Password?
                            </a>
                        </div>

                        {/* ── Submit ── */}
                        <div className="w-full mt-2">
                            <Button
                                type="submit"
                                color="tennisprimary"
                                disabled={isLoading}
                                aria-disabled={isLoading}
                            >
                                {isLoading && (
                                    <Spinner
                                        aria-hidden="true"
                                        size="md"
                                        className="fill-orange-500"
                                    />
                                )}
                                <span className={isLoading ? 'pl-3' : ''}>
                                    {isLoading
                                        ? 'Logging in…'
                                        : 'Log in to your account'}
                                </span>
                            </Button>
                        </div>
                    </form>

                    <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300 mt-4">
                        Not registered?&nbsp;
                        <a
                            href="/register"
                            className="text-cyan-700 hover:underline dark:text-cyan-500"
                        >
                            Create account
                        </a>
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
};

export default Login;
