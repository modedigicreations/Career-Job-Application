import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { taskSchema, taskUpdateSchema } from '../lib/validators';
import { AuthRequest, MANAGER_TIER } from '../middleware/auth';

const router = Router();

// Only manager-tier staff may assign a task to someone other than themselves.
function assigningSomeoneElse(req: AuthRequest, assignedTo: string | null | undefined) {
  return assignedTo && assignedTo !== req.userId && !MANAGER_TIER.includes(req.userRole || '');
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const where: any = {};
    if (projectId) where.projectId = projectId;
    const tasks = await prisma.task.findMany({ where, orderBy: { order: 'asc' } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    if (assigningSomeoneElse(req, parsed.data.assignedTo)) {
      return res.status(403).json({ error: 'Only a manager or admin can assign tasks to someone else' });
    }
    const task = await prisma.task.create({ data: parsed.data });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = taskUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    // Only block an actual reassignment (assignedTo changing to a new value) — a non-manager
    // editing some other field of a task that already belongs to someone else isn't reassigning.
    if (parsed.data.assignedTo !== undefined) {
      const existing = await prisma.task.findUnique({ where: { id: req.params.id }, select: { assignedTo: true } });
      if (!existing) return res.status(404).json({ error: 'Task not found' });
      if (parsed.data.assignedTo !== existing.assignedTo && assigningSomeoneElse(req, parsed.data.assignedTo)) {
        return res.status(403).json({ error: 'Only a manager or admin can assign tasks to someone else' });
      }
    }
    const task = await prisma.task.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
