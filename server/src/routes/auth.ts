import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateToken, authenticateToken, requireRole, MANAGER_TIER, AuthRequest } from '../middleware/auth';

const router = Router();

const VALID_ROLES = ['super-admin', 'admin', 'manager', 'sales', 'support', 'developer'];

// Staff accounts are provisioned by an admin, not self-registered — this is an internal CRM.
router.post('/register', authenticateToken, requireRole(...MANAGER_TIER), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || !name.trim() || !email.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedName.length > 200) {
      return res.status(400).json({ error: 'Name must be 200 characters or fewer' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 254) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 8 and 128 characters' });
    }
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
    }
    if ((role === 'super-admin' || role === 'admin') && req.userRole !== 'super-admin') {
      return res.status(403).json({ error: 'Only a super admin can create an admin or super-admin account' });
    }
    if (phone !== undefined && phone !== null && (typeof phone !== 'string' || phone.length > 50)) {
      return res.status(400).json({ error: 'Phone must be a string of 50 characters or fewer' });
    }

    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: trimmedName, email: trimmedEmail, password: hashedPassword, role: role || 'sales', phone },
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, isActive: user.isActive, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt },
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'This account has been deactivated. Contact an administrator.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: now } }),
      prisma.loginHistory.create({ data: { userId: user.id, loggedInAt: now } }),
    ]);

    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, isActive: user.isActive, lastLoginAt: now, createdAt: user.createdAt },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/login-history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const canViewAll = req.userRole === 'admin' || req.userRole === 'super-admin';
    const targetUserId = canViewAll && req.query.userId ? String(req.query.userId) : req.userId;
    const history = await prisma.loginHistory.findMany({
      where: { userId: targetUserId },
      orderBy: { loggedInAt: 'desc' },
      take: 200,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch login history' });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true, lastLoginAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
