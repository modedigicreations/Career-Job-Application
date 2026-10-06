import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest, MANAGER_TIER, ROLE_RANK } from '../middleware/auth';

const router = Router();

const PUBLIC_SELECT = { id: true, name: true, email: true, role: true, phone: true, isActive: true, lastLoginAt: true, createdAt: true };

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({ select: PUBLIC_SELECT, orderBy: { name: 'asc' } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const isSelf = req.userId === req.params.id;
    const isManagerTier = req.userRole && MANAGER_TIER.includes(req.userRole);
    if (!isSelf && !isManagerTier) {
      return res.status(403).json({ error: 'You do not have permission to update this user' });
    }

    const { name, phone, role, isActive } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name).trim();
    if (phone !== undefined) data.phone = phone === null ? null : String(phone);

    if (role !== undefined || isActive !== undefined) {
      if (!isManagerTier) {
        return res.status(403).json({ error: 'Only an admin can change role or active status' });
      }
      const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { role: true } });
      if (!target) return res.status(404).json({ error: 'User not found' });
      const actorRank = ROLE_RANK[req.userRole || ''] ?? 0;
      const targetRank = ROLE_RANK[target.role] ?? 0;
      if (targetRank >= actorRank) {
        return res.status(403).json({ error: 'You cannot change the role or active status of a user at or above your own rank' });
      }
      if (role === 'super-admin' && req.userRole !== 'super-admin') {
        return res.status(403).json({ error: 'Only a super admin can grant the super-admin role' });
      }
      if (role !== undefined) data.role = role;
      if (isActive !== undefined) data.isActive = Boolean(isActive);
    }

    const user = await prisma.user.update({ where: { id: req.params.id }, data, select: PUBLIC_SELECT });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
