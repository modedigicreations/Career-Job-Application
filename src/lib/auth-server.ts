import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET environment variable is required in production');
    }
    return 'mode-ops-dev-only-secret';
  }
  return secret;
}

export const SESSION_COOKIE = 'mode_ops_session';

export interface SessionPayload {
  userId: string;
}

export function createSessionToken(userId: string): string {
  return jwt.sign({ userId } as SessionPayload, getSessionSecret(), { expiresIn: '7d' });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getSessionSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

const BCRYPT_PREFIX = /^\$2[aby]\$/;

export function isHashedPassword(value: string | undefined | null): boolean {
  return !!value && BCRYPT_PREFIX.test(value);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

// Supports a transparent migration: existing records still hold the plaintext
// passwords this app shipped with. If the stored value isn't a bcrypt hash yet,
// fall back to a direct compare — callers are expected to re-hash and persist
// on a successful legacy match so every account migrates itself on next login.
export async function verifyPassword(plain: string, stored: string | undefined | null): Promise<boolean> {
  if (!stored) return false;
  if (isHashedPassword(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
}
