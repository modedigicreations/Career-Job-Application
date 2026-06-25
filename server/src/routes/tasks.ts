import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { taskSchema, taskUpdateSchema } from '../lib/validators';

const router = Router();

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

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const task = await prisma.task.create({ data: parsed.data });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = taskUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
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
