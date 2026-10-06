import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { dailySummarySchema } from '../lib/validators';
import { startOfDay } from '../lib/dates';
import { AuthRequest, MANAGER_TIER } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const canViewAll = MANAGER_TIER.includes(req.userRole || '');
    const targetUserId = canViewAll && req.query.userId ? String(req.query.userId) : req.userId;
    const where: any = { userId: targetUserId };
    if (req.query.from || req.query.to) {
      where.date = {};
      if (req.query.from) where.date.gte = startOfDay(new Date(String(req.query.from)));
      if (req.query.to) where.date.lte = startOfDay(new Date(String(req.query.to)));
    }
    const summaries = await prisma.dailySummary.findMany({ where, orderBy: { date: 'desc' } });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily summaries' });
  }
});

// One note per user per day — upsert so re-submitting the same day edits it instead of duplicating.
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = dailySummarySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const date = startOfDay(new Date(parsed.data.date));
    const summary = await prisma.dailySummary.upsert({
      where: { userId_date: { userId: req.userId!, date } },
      update: { note: parsed.data.note },
      create: { userId: req.userId!, date, note: parsed.data.note },
    });
    res.status(201).json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save daily summary' });
  }
});

export default router;
