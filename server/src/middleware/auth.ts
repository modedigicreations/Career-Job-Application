import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  return secret || 'mode-crm-dev-only-secret';
}

const JWT_SECRET = getJwtSecret();

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    // 401 (not 403): this is "you're not authenticated," distinct from a valid
    // session being forbidden from an action — the client treats only this as
    // a reason to force a logout.
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
}

export const MANAGER_TIER = ['manager', 'admin', 'super-admin'];

// Higher number = more authority. Used to stop a lower-ranked manager-tier
// user from editing the role/active-status of an equal-or-higher-ranked one
// (e.g. a plain 'manager' demoting or deactivating an 'admin').
export const ROLE_RANK: Record<string, number> = {
  'super-admin': 4,
  admin: 3,
  manager: 2,
  sales: 1,
  support: 1,
  developer: 1,
};
