/**
 * register.utils.test.ts
 *
 * Pure function unit tests — no mocks, no DOM, lightning fast.
 * Covers: sanitizeUsername, sanitizeEmail, sanitizePassword,
 *         getPasswordStrength, isEmailValid, createButtonIsEnabled logic
 *
 * Run: vitest run
 */

import { describe, it, expect } from 'vitest';

// ─── Functions under test ─────────────────────────────────────────────────────
// Recommended: extract these to register.utils.ts and import from both
// the component and this file. Until then they are redefined here.

const sanitizeUsername = (value: string): string =>
    value.trim().replace(/[^a-zA-Z0-9_\-.]/g, '').slice(0, 20);

const sanitizeEmail = (value: string): string =>
    value.trim().toLowerCase().slice(0, 254);

const sanitizePassword = (value: string): string =>
    value.replace(/[\x00-\x1F\x7F]/g, '');

type PasswordStrength = 'weak' | 'fair' | 'strong';

const getPasswordStrength = (password: string): PasswordStrength => {
    if (password.length < 8) return 'weak';
    const hasUpper   = /[A-Z]/.test(password);
    const hasLower   = /[a-z]/.test(password);
    const hasDigit   = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    if (score <= 2) return 'weak';
    if (score === 3) return 'fair';
    return 'strong';
};

// Mirrors the component's isEmailValid derived value.
// Only validates after the field has been touched (onBlur fired).
const isEmailValid = (email: string, touched: boolean): boolean =>
    !touched || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Mirrors the component's createButtonIsEnabled useEffect logic.
const isFormSubmittable = (
    username: string,
    password: string,
    password2: string,
    email: string,
    emailTouched: boolean,
): boolean => {
    const isUsernameValid  = username.length >= 4 && username.length <= 20;
    const strength         = getPasswordStrength(password);
    const isPasswordValid  = strength === 'fair' || strength === 'strong';
    const passwordsMatch   = password === password2;
    const showMismatch     = password2.length > 0 && !passwordsMatch;
    const emailOk          = isEmailValid(email, emailTouched);
    return isPasswordValid && passwordsMatch && !showMismatch && isUsernameValid && emailOk;
};

// ─── sanitizeUsername ─────────────────────────────────────────────────────────

describe('sanitizeUsername', () => {
    it('trims surrounding whitespace', () => {
        expect(sanitizeUsername('  john  ')).toBe('john');
    });

    it('strips disallowed characters', () => {
        expect(sanitizeUsername('jo<hn>!')).toBe('john');
    });

    it('allows alphanumeric characters', () => {
        expect(sanitizeUsername('John123')).toBe('John123');
    });

    it('allows underscores, hyphens, and dots', () => {
        expect(sanitizeUsername('jo_hn-smith.2')).toBe('jo_hn-smith.2');
    });

    it('truncates to 20 characters', () => {
        expect(sanitizeUsername('a'.repeat(30))).toHaveLength(20);
    });

    it('keeps exactly 20 characters when input is 20', () => {
        expect(sanitizeUsername('a'.repeat(20))).toHaveLength(20);
    });

    it('returns empty string for empty input', () => {
        expect(sanitizeUsername('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
        expect(sanitizeUsername('   ')).toBe('');
    });

    it('strips the @ sign', () => {
        expect(sanitizeUsername('user@name')).toBe('username');
    });

    it('strips spaces within the value', () => {
        expect(sanitizeUsername('jo hn')).toBe('john');
    });
});

// ─── sanitizeEmail ────────────────────────────────────────────────────────────

describe('sanitizeEmail', () => {
    it('converts to lowercase', () => {
        expect(sanitizeEmail('JOHN@EXAMPLE.COM')).toBe('john@example.com');
    });

    it('trims surrounding whitespace', () => {
        expect(sanitizeEmail('  john@example.com  ')).toBe('john@example.com');
    });

    it('truncates to 254 characters (RFC 5321 limit)', () => {
        expect(sanitizeEmail('a'.repeat(250) + '@b.com')).toHaveLength(254);
    });

    it('returns empty string for empty input', () => {
        expect(sanitizeEmail('')).toBe('');
    });

    it('handles mixed case and whitespace together', () => {
        expect(sanitizeEmail('  User.Name@Example.COM  ')).toBe('user.name@example.com');
    });
});

// ─── sanitizePassword ────────────────────────────────────────────────────────

describe('sanitizePassword', () => {
    it('leaves a normal password unchanged', () => {
        expect(sanitizePassword('Password123!')).toBe('Password123!');
    });

    it('strips null bytes', () => {
        expect(sanitizePassword('pass\x00word')).toBe('password');
    });

    it('strips control characters (\\x01–\\x1F)', () => {
        expect(sanitizePassword('pas\x01s\x1Fword')).toBe('password');
    });

    it('strips the DEL character (\\x7F)', () => {
        expect(sanitizePassword('pas\x7Fsword')).toBe('password');
    });

    it('preserves special printable ASCII characters', () => {
        const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        expect(sanitizePassword(special)).toBe(special);
    });

    it('does not trim — spaces are valid password characters', () => {
        expect(sanitizePassword('  password  ')).toBe('  password  ');
    });

    it('returns empty string for empty input', () => {
        expect(sanitizePassword('')).toBe('');
    });

    it('returns empty string for input made entirely of control chars', () => {
        expect(sanitizePassword('\x00\x01\x1F\x7F')).toBe('');
    });
});

// ─── getPasswordStrength ──────────────────────────────────────────────────────

describe('getPasswordStrength', () => {
    describe('weak — short password', () => {
        it('empty string → weak', () => {
            expect(getPasswordStrength('')).toBe('weak');
        });

        it('7 characters → weak (below threshold)', () => {
            expect(getPasswordStrength('Abc123!')).toBe('weak');
        });
    });

    describe('weak — 8+ characters but too few character types', () => {
        it('lowercase only → weak', () => {
            expect(getPasswordStrength('abcdefgh')).toBe('weak');
        });

        it('lowercase + uppercase (score=2) → weak', () => {
            expect(getPasswordStrength('abcdEFGH')).toBe('weak');
        });

        it('lowercase + digit (score=2) → weak', () => {
            expect(getPasswordStrength('abcdef12')).toBe('weak');
        });
    });

    describe('fair — 8+ characters, 3 character types', () => {
        it('lowercase + uppercase + digit → fair', () => {
            expect(getPasswordStrength('Abcdef12')).toBe('fair');
        });

        it('lowercase + uppercase + special → fair', () => {
            expect(getPasswordStrength('Abcdefg!')).toBe('fair');
        });

        it('lowercase + digit + special → fair', () => {
            expect(getPasswordStrength('abcdef1!')).toBe('fair');
        });
    });

    describe('strong — 8+ characters, all 4 character types', () => {
        it('lowercase + uppercase + digit + special → strong', () => {
            expect(getPasswordStrength('Abcdef1!')).toBe('strong');
        });

        it('long strong password → strong', () => {
            expect(getPasswordStrength('MyS3cur3P@ssword!')).toBe('strong');
        });
    });

    describe('edge cases', () => {
        it('space counts as a special character', () => {
            expect(getPasswordStrength('Abcdefg ')).toBe('fair');
        });
    });
});

// ─── isEmailValid (onBlur logic) ──────────────────────────────────────────────

describe('isEmailValid', () => {
    describe('before the field is touched (emailTouched = false)', () => {
        it('empty string → valid (no error shown yet)', () => {
            expect(isEmailValid('', false)).toBe(true);
        });

        it('invalid format → valid (no error shown yet)', () => {
            expect(isEmailValid('notanemail', false)).toBe(true);
        });

        it('partially typed email → valid (no error shown yet)', () => {
            expect(isEmailValid('john@', false)).toBe(true);
        });
    });

    describe('after the field is touched (emailTouched = true)', () => {
        it('valid email → valid', () => {
            expect(isEmailValid('john@example.com', true)).toBe(true);
        });

        it('valid email with subdomain → valid', () => {
            expect(isEmailValid('john@mail.example.co.uk', true)).toBe(true);
        });

        it('empty string → invalid', () => {
            expect(isEmailValid('', true)).toBe(false);
        });

        it('missing @ → invalid', () => {
            expect(isEmailValid('johnexample.com', true)).toBe(false);
        });

        it('missing domain → invalid', () => {
            expect(isEmailValid('john@', true)).toBe(false);
        });

        it('missing TLD → invalid', () => {
            expect(isEmailValid('john@example', true)).toBe(false);
        });

        it('space in email → invalid', () => {
            expect(isEmailValid('jo hn@example.com', true)).toBe(false);
        });
    });
});

// ─── createButtonIsEnabled (form submit gate) ─────────────────────────────────

describe('createButtonIsEnabled', () => {
    // Baseline valid values — individual tests override one field at a time
    const valid = {
        username:     'johndoe',
        password:     'Abcdef12',   // fair
        password2:    'Abcdef12',
        email:        'john@example.com',
        emailTouched: true,
    };

    const check = (overrides: Partial<typeof valid>) => {
        const v = { ...valid, ...overrides };
        return isFormSubmittable(v.username, v.password, v.password2, v.email, v.emailTouched);
    };

    it('returns true when all fields are valid', () => {
        expect(isFormSubmittable(
            valid.username, valid.password, valid.password2,
            valid.email, valid.emailTouched,
        )).toBe(true);
    });

    it('returns true with a strong password', () => {
        expect(check({ password: 'Abcdef1!', password2: 'Abcdef1!' })).toBe(true);
    });

    describe('username validation', () => {
        it('username shorter than 4 chars → disabled', () => {
            expect(check({ username: 'jo' })).toBe(false);
        });

        it('username exactly 4 chars → enabled', () => {
            expect(check({ username: 'john' })).toBe(true);
        });

        it('username exactly 20 chars → enabled', () => {
            expect(check({ username: 'a'.repeat(20) })).toBe(true);
        });

        it('username longer than 20 chars → disabled', () => {
            // sanitizeUsername would truncate this in the component,
            // but the raw length check here reflects the pre-sanitized state
            expect(check({ username: 'a'.repeat(21) })).toBe(false);
        });

        it('empty username → disabled', () => {
            expect(check({ username: '' })).toBe(false);
        });
    });

    describe('password validation', () => {
        it('weak password → disabled', () => {
            expect(check({ password: 'abcdefgh', password2: 'abcdefgh' })).toBe(false);
        });

        it('fair password → enabled', () => {
            expect(check({ password: 'Abcdef12', password2: 'Abcdef12' })).toBe(true);
        });

        it('strong password → enabled', () => {
            expect(check({ password: 'Abcdef1!', password2: 'Abcdef1!' })).toBe(true);
        });

        it('password shorter than 8 chars → disabled', () => {
            expect(check({ password: 'Abc1!', password2: 'Abc1!' })).toBe(false);
        });
    });

    describe('password confirmation', () => {
        it('passwords do not match → disabled', () => {
            expect(check({ password2: 'Different1!' })).toBe(false);
        });

        it('password2 empty → disabled (passwords do not match)', () => {
            expect(check({ password2: '' })).toBe(false);
        });
    });

    describe('email validation', () => {
        it('invalid email after touch → disabled', () => {
            expect(check({ email: 'notanemail', emailTouched: true })).toBe(false);
        });

        it('invalid email before touch → enabled (no error shown yet)', () => {
            expect(check({ email: 'notanemail', emailTouched: false })).toBe(true);
        });

        it('empty email after touch → disabled', () => {
            expect(check({ email: '', emailTouched: true })).toBe(false);
        });

        it('valid email after touch → enabled', () => {
            expect(check({ email: 'jane@example.com', emailTouched: true })).toBe(true);
        });
    });
});
