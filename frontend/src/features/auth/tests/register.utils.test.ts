/**
 * register.utils.test.ts
 *
 * Pure function unit tests — no mocks, no DOM, lightning fast.
 * Covers: sanitizeUsername, sanitizeEmail, sanitizePassword, getPasswordStrength
 *
 * Run: vitest run
 */

import { describe, it, expect } from 'vitest';

// ─── Functions under test ─────────────────────────────────────────────────────
// These are currently defined inside the Register component.
// Recommended: extract them to a separate file (e.g. register.utils.ts)
// and import from both the component and here.
// Until then, they are redefined here — the logic is identical.

const sanitizeUsername = (value: string): string =>
    value.trim().replace(/[^a-zA-Z0-9_\-.]/g, '').slice(0, 20);

const sanitizeEmail = (value: string): string =>
    value.trim().toLowerCase().slice(0, 254);

const sanitizePassword = (value: string): string =>
    value.replace(/[\x00-\x1F\x7F]/g, '');

type PasswordStrength = 'weak' | 'fair' | 'strong';

const getPasswordStrength = (password: string): PasswordStrength => {
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
        const long = 'a'.repeat(30);
        expect(sanitizeUsername(long)).toHaveLength(20);
    });

    it('keeps exactly 20 characters when input is 20', () => {
        const twenty = 'a'.repeat(20);
        expect(sanitizeUsername(twenty)).toHaveLength(20);
    });

    it('returns empty string for empty input', () => {
        expect(sanitizeUsername('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
        expect(sanitizeUsername('   ')).toBe('');
    });

    it('strips the @ sign (email-like input)', () => {
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
        const long = 'a'.repeat(250) + '@b.com'; // 256 chars
        expect(sanitizeEmail(long)).toHaveLength(254);
    });

    it('keeps exactly 254 characters when input is 254', () => {
        const exact = 'a'.repeat(249) + '@b.co'; // 254 chars
        expect(sanitizeEmail(exact)).toHaveLength(254);
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

    it('preserves unicode / accented characters', () => {
        expect(sanitizePassword('Árvíztűrő1!')).toBe('Árvíztűrő1!');
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

        it('exactly 7 characters → weak', () => {
            expect(getPasswordStrength('abcdefg')).toBe('weak');
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

        it('exactly 8 characters with all 4 types → strong', () => {
            expect(getPasswordStrength('Aa1!aaaa')).toBe('strong');
        });
    });

    describe('edge cases', () => {
        it('exactly 8 characters, lowercase only → weak', () => {
            expect(getPasswordStrength('abcdefgh')).toBe('weak');
        });

        it('9 characters, uppercase only → weak', () => {
            expect(getPasswordStrength('ABCDEFGHI')).toBe('weak');
        });

        it('space counts as a special character', () => {
            // lowercase + uppercase + space = 3 types → fair
            expect(getPasswordStrength('Abcdefg ')).toBe('fair');
        });
    });
});
