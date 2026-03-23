import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/core/store/useAuthStore';
import {
    sanitizeEmail,
    sanitizePassword,
    sanitizeUsername,
} from './useRegisterForm';

interface UseRegisterMutationOptions {
    username: string;
    password: string;
    password2: string;
    email: string;
    passwordsMatch: boolean;
    onSuccess: () => void;
}

export function useRegisterMutation({
    username,
    password,
    password2,
    email,
    passwordsMatch,
    onSuccess,
}: UseRegisterMutationOptions) {
    const { register } = useAuthStore();
    const usernameInputRef = useRef<HTMLInputElement>(null);

    const mutation = useMutation({
        mutationFn: () =>
            register(
                sanitizeUsername(username),
                sanitizePassword(password),
                sanitizePassword(password2),
                sanitizeEmail(email)
            ),
        onSuccess,
        onError: () => {
            // Error is already set inside useAuthStore.register;
            // focus the first field for screen readers.
            usernameInputRef.current?.focus();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch || mutation.isPending) return;
        mutation.mutate();
    };

    return {
        handleSubmit,
        isLoading: mutation.isPending,
        usernameInputRef,
    };
}
