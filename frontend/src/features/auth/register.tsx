import React, { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../core/store/useAuthStore';
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
import { customTheme } from '../../shared/formThemes';
import ModalOpenTriggerButton from './ModalOpenTriggerButton';

// ─── Sanitization helpers ────────────────────────────────────────────────────
// Trim and strip characters that have no place in these fields.
// Backend must always re-validate — these are UX guards only.
const sanitizeUsername = (value: string): string =>
    value
        .trim()
        .replace(/[^a-zA-Z0-9_\-.]/g, '')
        .slice(0, 20);

const sanitizeEmail = (value: string): string =>
    value.trim().toLowerCase().slice(0, 254); // RFC 5321 max

const sanitizePassword = (value: string): string =>
    // Allow any printable ASCII; strip null bytes and control chars
    value.replace(/[\x00-\x1F\x7F]/g, '');

// ─── Password strength ───────────────────────────────────────────────────────
type PasswordStrength = 'weak' | 'fair' | 'strong';

const getPasswordStrength = (password: string): PasswordStrength => {
    if (password.length < 8) return 'weak';
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(
        Boolean
    ).length;
    if (score <= 2) return 'weak';
    if (score === 3) return 'fair';
    return 'strong';
};

const strengthMeta: Record<
    PasswordStrength,
    { label: string; color: string; width: string }
> = {
    weak: { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' },
    fair: { label: 'Fair', color: 'bg-yellow-400', width: 'w-2/3' },
    strong: { label: 'Strong', color: 'bg-green-500', width: 'w-full' },
};

// ─── Component ───────────────────────────────────────────────────────────────
const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);

    const isLoggedIn = useAuthStore.getState().isAuthenticated;
    const { register, error, clearError } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const usernameInputRef = useRef<HTMLInputElement>(null);

    // Stable IDs for aria-describedby associations
    const usernameErrorId = useId();
    const passwordHintId = useId();
    const password2ErrorId = useId();
    const formErrorId = useId();

    // ── Side-effects ──
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/lobby');
            return;
        }
        if (location.pathname === '/register') setOpenModal(true);
    }, [isLoggedIn, navigate, location.pathname]);

    useEffect(() => {
        if (error && usernameInputRef.current) {
            usernameInputRef.current.focus();
        }
    }, [error]);

    // ── Derived state ──
    const passwordStrength = password ? getPasswordStrength(password) : null;
    const passwordsMatch = password === password2;
    const showMismatchError = password2.length > 0 && !passwordsMatch;
    const isEmailValid =
        !emailTouched || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // ── Reset ──
    const resetForm = () => {
        setUsername('');
        setPassword('');
        setPassword2('');
        setEmail('');
    };

    const handleClose = () => {
        setOpenModal(false);
        resetForm();
        clearError();
    };

    // ── TanStack mutation ──
    const registerMutation = useMutation({
        mutationFn: () =>
            register(
                sanitizeUsername(username),
                sanitizePassword(password),
                sanitizePassword(password2),
                sanitizeEmail(email)
            ),
        onSuccess: () => {
            resetForm();
        },
        onError: () => {
            // Error is already set inside useAuthStore.register;
            // focus the first field for screen readers.
            usernameInputRef.current?.focus();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch || registerMutation.isPending) return;
        registerMutation.mutate();
    };

    const isLoading = registerMutation.isPending;

    // ── Render ──
    return (
        <>
            <ModalOpenTriggerButton
                buttonText="Register"
                onClick={() => setOpenModal(true)}
            />

            <ThemeProvider theme={customTheme}>
                <Modal
                    id="register-modal"
                    show={openModal}
                    size="md"
                    popup
                    position="top-center"
                    dismissible
                    onClose={handleClose}
                    initialFocus={usernameInputRef}
                    aria-labelledby="register-modal-title"
                >
                    <ModalHeader
                        id="register-modal-title"
                        className="text-xl font-medium text-gray-900 pl-4"
                    >
                        Sign up to our platform
                    </ModalHeader>

                    <ModalBody>
                        {/* Live region: screen readers announce server errors */}
                        <div
                            id={formErrorId}
                            role="alert"
                            aria-live="polite"
                            aria-atomic="true"
                            className={error ? 'mb-3' : 'sr-only'}
                        >
                            {error && (
                                <p className="text-sm text-red-700 pl-1">
                                    Passwords must be at least 8 characters and
                                    contain uppercase letters. Email must be
                                    unique. Please try again.
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
                                <Label
                                    htmlFor="username"
                                    className="mb-1 block"
                                >
                                    Your username
                                    {error && (
                                        <span
                                            id={usernameErrorId}
                                            className="pl-3 text-red-700 text-sm"
                                            aria-live="polite"
                                        >
                                            Username may already be taken.
                                        </span>
                                    )}
                                </Label>
                                <TextInput
                                    ref={usernameInputRef}
                                    type="text"
                                    id="username"
                                    name="username"
                                    autoComplete="username"
                                    maxLength={20}
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
                                    placeholder="Username (max 20 characters)"
                                    required
                                    color="tennisprimary"
                                />
                            </div>

                            {/* ── Password ── */}
                            <div className="mb-3">
                                <Label
                                    htmlFor="password"
                                    className="mb-1 block"
                                >
                                    Your password
                                </Label>
                                <TextInput
                                    type="password"
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    value={password}
                                    aria-required="true"
                                    aria-describedby={passwordHintId}
                                    onChange={(e) => {
                                        setPassword(
                                            sanitizePassword(e.target.value)
                                        );
                                        clearError();
                                    }}
                                    placeholder="Password"
                                    required
                                    color="tennisprimary"
                                />
                                {/* Password strength meter */}
                                {password && passwordStrength && (
                                    <div className="mt-1" id={passwordHintId}>
                                        <div
                                            className="h-2 w-full rounded bg-gray-200"
                                            role="meter"
                                            aria-label="Password strength"
                                            aria-valuenow={
                                                passwordStrength === 'weak'
                                                    ? 1
                                                    : passwordStrength ===
                                                        'fair'
                                                      ? 2
                                                      : 3
                                            }
                                            aria-valuemin={1}
                                            aria-valuemax={3}
                                        >
                                            <div
                                                className={`h-2 rounded transition-all duration-300 ${strengthMeta[passwordStrength].color} ${strengthMeta[passwordStrength].width}`}
                                            />
                                        </div>
                                        <p className="text-xs mt-0.5 text-gray-500">
                                            Strength:{' '}
                                            <span className="font-medium">
                                                {
                                                    strengthMeta[
                                                        passwordStrength
                                                    ].label
                                                }
                                            </span>
                                            {' — '}min 8 chars, uppercase,
                                            number recommended.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ── Confirm Password ── */}
                            <div className="mb-3">
                                <Label
                                    htmlFor="confirm-password"
                                    className="mb-1 block"
                                >
                                    Repeat password
                                </Label>
                                <TextInput
                                    type="password"
                                    id="confirm-password"
                                    name="confirm-password"
                                    autoComplete="new-password"
                                    value={password2}
                                    aria-required="true"
                                    aria-invalid={showMismatchError}
                                    aria-describedby={
                                        showMismatchError
                                            ? password2ErrorId
                                            : undefined
                                    }
                                    onChange={(e) => {
                                        setPassword2(
                                            sanitizePassword(e.target.value)
                                        );
                                        clearError();
                                    }}
                                    placeholder="Confirm password"
                                    required
                                    color="tennisprimary"
                                />
                                {showMismatchError && (
                                    <p
                                        id={password2ErrorId}
                                        role="alert"
                                        className="text-sm text-red-600 mt-0.5"
                                    >
                                        Passwords do not match.
                                    </p>
                                )}
                            </div>

                            {/* ── Email ── */}
                            <div className="mb-4">
                                <Label htmlFor="email" className="mb-1 block">
                                    Email
                                </Label>
                                <TextInput
                                    type="text"
                                    inputMode="email"
                                    id="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    aria-required="true"
                                    aria-invalid={!isEmailValid}
                                    aria-describedby={
                                        !isEmailValid
                                            ? 'email-error'
                                            : undefined
                                    }
                                    onBlur={() => setEmailTouched(true)}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    required
                                    color="tennisprimary"
                                />
                                {!isEmailValid && (
                                    <p
                                        id="email-error"
                                        role="alert"
                                        className="text-sm text-red-600 mt-0.5"
                                    >
                                        Valid email please.
                                    </p>
                                )}
                            </div>

                            {/* ── Submit ── */}
                            <Button
                                type="submit"
                                color="tennisprimary"
                                disabled={isLoading || showMismatchError}
                                aria-disabled={isLoading || showMismatchError}
                                // className="w-full"
                            >
                                {isLoading && (
                                    <Spinner
                                        aria-hidden="true"
                                        size="md"
                                        className="fill-orange-500"
                                    />
                                )}
                                <span className={isLoading ? 'pl-2' : ''}>
                                    {isLoading
                                        ? 'Creating account…'
                                        : 'Create new account'}
                                </span>
                            </Button>
                        </form>
                    </ModalBody>
                </Modal>
            </ThemeProvider>
        </>
    );
};

export default Register;
