import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { activitySchema } from '../lib/validators';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId, limit } = req.query;
    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    const take = limit ? Math.min(parseInt(limit as string, 10), 200) : 50;
    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const activity = await prisma.activity.create({ data: parsed.data });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

export default router;
