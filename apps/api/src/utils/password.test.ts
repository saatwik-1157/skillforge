/**
 * Unit tests for the bcrypt password helpers.
 *
 * `password.ts` -> `config/env.ts` validates required env vars at import time and
 * calls `process.exit(1)` if any are missing, so we provide safe defaults for
 * the required keys before importing the module under test.
 */
import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV ??= 'test';
  process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/skillforge_test';
  process.env.JWT_ACCESS_SECRET ??= 'test-access-secret';
  process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret';
  // Keep bcrypt rounds low so the test suite stays fast.
  process.env.BCRYPT_ROUNDS ??= '4';
});

describe('password helpers', () => {
  it('hashPassword produces a verifiable, non-plaintext hash', async () => {
    const { hashPassword, verifyPassword } = await import('./password');

    const plain = 'Password123';
    const hash = await hashPassword(plain);

    // The hash must not be the plaintext and must look like a bcrypt hash.
    expect(hash).not.toBe(plain);
    expect(hash).toMatch(/^\$2[aby]\$/);

    // The correct password verifies against its own hash.
    await expect(verifyPassword(plain, hash)).resolves.toBe(true);
  });

  it('verifyPassword rejects a wrong password', async () => {
    const { hashPassword, verifyPassword } = await import('./password');

    const hash = await hashPassword('Password123');

    await expect(verifyPassword('WrongPassword', hash)).resolves.toBe(false);
    await expect(verifyPassword('password123', hash)).resolves.toBe(false); // case-sensitive
    await expect(verifyPassword('', hash)).resolves.toBe(false);
  });

  it('produces different hashes for the same input (random salt)', async () => {
    const { hashPassword } = await import('./password');

    const a = await hashPassword('Password123');
    const b = await hashPassword('Password123');

    expect(a).not.toBe(b);
  });
});
