import { useEffect, useState } from 'react';

// ─── Sanitization helpers ─────────────────────────────────────────────────────
export const sanitizeUsername = (value: string): string =>
    value
        .trim()
        .replace(/[^a-zA-Z0-9_\-.]/g, '')
        .slice(0, 20);

export const sanitizeEmail = (value: string): string =>
    value.trim().toLowerCase().slice(0, 254); // RFC 5321 max

export const sanitizePassword = (value: string): string =>
    value.replace(/[\x00-\x1F\x7F]/g, '');

// ─── Password strength ────────────────────────────────────────────────────────
export type PasswordStrength = 'weak' | 'fair' | 'strong';

export const getPasswordStrength = (password: string): PasswordStrength => {
    if (password.length < 8) return 'weak';
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    if (score <= 2) return 'weak';
    if (score === 3) return 'fair';
    return 'strong';
};

export const strengthMeta: Record<
    PasswordStrength,
    { label: string; color: string; width: string }
> = {
    weak: { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' },
    fair: { label: 'Fair', color: 'bg-yellow-400', width: 'w-2/3' },
    strong: { label: 'Strong', color: 'bg-green-500', width: 'w-full' },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UseRegisterFormOptions {
    isLoading: boolean;
    clearError: () => void;
}

export function useRegisterForm({ isLoading, clearError }: UseRegisterFormOptions) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [createButtonIsEnabled, setCreateButtonIsEnabled] = useState(false);

    // ── Derived state ──
    const passwordStrength = password ? getPasswordStrength(password) : null;
    const passwordsMatch = password === password2;
    const showMismatchError = password2.length > 0 && !passwordsMatch;
    const isEmailValid = !emailTouched || EMAIL_REGEX.test(email);
    const isEmailFilled = EMAIL_REGEX.test(email);

    useEffect(() => {
        const isUsernameValid = username.length >= 4 && username.length <= 20;
        const isPasswordValid =
            getPasswordStrength(password) === 'fair' ||
            getPasswordStrength(password) === 'strong';
        setCreateButtonIsEnabled(
            !isLoading &&
            isPasswordValid &&
            passwordsMatch &&
            !showMismatchError &&
            isUsernameValid &&
            isEmailFilled
        );
    }, [username, password, password2, email, isEmailFilled, isLoading]);

    const reset = () => {
        setUsername('');
        setPassword('');
        setPassword2('');
        setEmail('');
        setEmailTouched(false);
    };

    const handleUsernameChange = (value: string) => {
        setUsername(sanitizeUsername(value));
        clearError();
    };

    const handlePasswordChange = (value: string) => {
        setPassword(sanitizePassword(value));
        clearError();
    };

    const handlePassword2Change = (value: string) => {
        setPassword2(sanitizePassword(value));
        clearError();
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
    };

    return {
        // values
        username,
        email,
        password,
        password2,
        // derived
        passwordStrength,
        passwordsMatch,
        showMismatchError,
        isEmailValid,
        isEmailFilled,
        createButtonIsEnabled,
        emailTouched,
        // actions
        handleUsernameChange,
        handlePasswordChange,
        handlePassword2Change,
        handleEmailChange,
        setEmailTouched,
        reset,
    };
}
