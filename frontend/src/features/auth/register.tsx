import React, { useId } from 'react';
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
import { useAuthStore } from '../../core/store/useAuthStore';
import { customTheme } from '../../shared/formThemes';
import ModalOpenTriggerButton from './ModalOpenTriggerButton';
import {
    useRegisterForm,
    strengthMeta,
} from './register_hooks/useRegisterForm';
import { useRegisterModal } from './register_hooks/useRegisterModal';
import { useRegisterMutation } from './register_hooks/useRegisterMutation';

const Register: React.FC = () => {
    const { error, clearError } = useAuthStore();

    // Stable IDs for aria-describedby associations
    const usernameErrorId = useId();
    const passwordHintId = useId();
    const password2ErrorId = useId();
    const formErrorId = useId();

    // isLoading needed by the form hook → initialize with a temp value,
    // then wire them together via a shared loading state.
    // Simplest approach: initialize form first with isLoading=false,
    // then pass real isLoading from the mutation.
    const form = useRegisterForm({ isLoading: false, clearError });

    const {
        handleSubmit: submit,
        isLoading: loading,
        usernameInputRef: inputRef,
    } = useRegisterMutation({
        username: form.username,
        password: form.password,
        password2: form.password2,
        email: form.email,
        passwordsMatch: form.passwordsMatch,
        onSuccess: form.reset,
    });

    const { openModal, setOpenModal, handleClose } = useRegisterModal({
        onClose: () => {
            form.reset();
            clearError();
        },
    });

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
                    initialFocus={inputRef}
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
                            onSubmit={submit}
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
                                            Username is already taken.
                                        </span>
                                    )}
                                </Label>
                                <TextInput
                                    ref={inputRef}
                                    type="text"
                                    id="username"
                                    name="username"
                                    autoComplete="username"
                                    maxLength={20}
                                    value={form.username}
                                    aria-required="true"
                                    aria-invalid={!!error}
                                    aria-describedby={
                                        error ? usernameErrorId : undefined
                                    }
                                    onChange={(e) =>
                                        form.handleUsernameChange(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Username (min 5, max 20 characters)"
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
                                    value={form.password}
                                    aria-required="true"
                                    aria-describedby={passwordHintId}
                                    onChange={(e) =>
                                        form.handlePasswordChange(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Password"
                                    required
                                    color="tennisprimary"
                                />
                                {form.password && form.passwordStrength && (
                                    <div className="mt-1" id={passwordHintId}>
                                        <div
                                            className="h-2 w-full rounded bg-gray-200"
                                            role="meter"
                                            aria-label="Password strength"
                                            aria-valuenow={
                                                form.passwordStrength === 'weak'
                                                    ? 1
                                                    : form.passwordStrength ===
                                                        'fair'
                                                      ? 2
                                                      : 3
                                            }
                                            aria-valuemin={1}
                                            aria-valuemax={3}
                                        >
                                            <div
                                                className={`h-2 rounded transition-all duration-300 ${strengthMeta[form.passwordStrength].color} ${strengthMeta[form.passwordStrength].width}`}
                                            />
                                        </div>
                                        <p className="text-xs mt-0.5 text-gray-500">
                                            Strength:{' '}
                                            <span className="font-medium">
                                                {
                                                    strengthMeta[
                                                        form.passwordStrength
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
                                    value={form.password2}
                                    aria-required="true"
                                    aria-invalid={form.showMismatchError}
                                    aria-describedby={
                                        form.showMismatchError
                                            ? password2ErrorId
                                            : undefined
                                    }
                                    onChange={(e) =>
                                        form.handlePassword2Change(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Confirm password"
                                    required
                                    color="tennisprimary"
                                />
                                {form.showMismatchError && (
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
                                    value={form.email}
                                    aria-required="true"
                                    aria-invalid={!form.isEmailValid}
                                    aria-describedby={
                                        !form.isEmailValid
                                            ? 'email-error'
                                            : undefined
                                    }
                                    onBlur={() => form.setEmailTouched(true)}
                                    onChange={(e) =>
                                        form.handleEmailChange(e.target.value)
                                    }
                                    placeholder="email@example.com"
                                    required
                                    color="tennisprimary"
                                />
                                {!form.isEmailValid && (
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
                                disabled={!form.createButtonIsEnabled}
                                aria-disabled={!form.createButtonIsEnabled}
                            >
                                {loading && (
                                    <Spinner
                                        aria-hidden="true"
                                        size="md"
                                        className="fill-orange-500"
                                    />
                                )}
                                <span className={loading ? 'pl-2' : ''}>
                                    {loading
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
