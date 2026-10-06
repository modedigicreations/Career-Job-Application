import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { personalGoalSchema, personalGoalUpdateSchema } from '../lib/validators';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Personal goals are strictly self-owned — nobody, including managers, may create or edit another user's goal.
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const goals = await prisma.personalGoal.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = personalGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const goal = await prisma.personalGoal.create({ data: { ...parsed.data, userId: req.userId! } });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.personalGoal.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Goal not found' });
    if (existing.userId !== req.userId) return res.status(403).json({ error: 'You can only edit your own goals' });

    const parsed = personalGoalUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const goal = await prisma.personalGoal.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.personalGoal.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Goal not found' });
    if (existing.userId !== req.userId) return res.status(403).json({ error: 'You can only delete your own goals' });

    await prisma.personalGoal.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
