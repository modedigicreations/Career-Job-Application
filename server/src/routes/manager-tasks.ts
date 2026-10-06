import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { managerTaskSchema, managerTaskAssigneeUpdateSchema, managerTaskOwnerUpdateSchema } from '../lib/validators';
import { AuthRequest, MANAGER_TIER } from '../middleware/auth';

const router = Router();

// One Minute Manager tasks: only manager-tier staff may create/reassign them (item 3/9);
// the assignee may update their own status/description, but never reassign (item 8).
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.managerTask.findMany({
      where: { OR: [{ assignedTo: req.userId }, { assignedBy: req.userId }] },
      orderBy: { createdAt: 'desc' },
      include: { assignee: { select: { id: true, name: true } }, creator: { select: { id: true, name: true } } },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!MANAGER_TIER.includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Only a manager or admin can assign tasks here' });
    }
    const parsed = managerTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const task = await prisma.managerTask.create({ data: { ...parsed.data, assignedBy: req.userId! } });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.managerTask.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const isCreator = existing.assignedBy === req.userId;
    const isAssignee = existing.assignedTo === req.userId;
    if (!isCreator && !isAssignee) {
      return res.status(403).json({ error: 'You do not have access to this task' });
    }

    const schema = isCreator ? managerTaskOwnerUpdateSchema : managerTaskAssigneeUpdateSchema;
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const task = await prisma.managerTask.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.managerTask.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.assignedBy !== req.userId && req.userRole !== 'super-admin') {
      return res.status(403).json({ error: 'Only the task creator can delete it' });
    }
    await prisma.managerTask.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
