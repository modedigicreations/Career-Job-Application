import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { projectSchema, projectUpdateSchema } from '../lib/validators';

const router = Router();

function deserialize<T extends { assignedTeam: string }>(project: T) {
  let assignedTeam: string[] = [];
  try { assignedTeam = JSON.parse(project.assignedTeam); } catch { /* malformed, default to [] */ }
  return { ...project, assignedTeam };
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { clientName: { contains: search as string } },
      ];
    }
    const projects = await prisma.project.findMany({ where, orderBy: { createdAt: 'desc' }, include: { tasks: true } });
    res.json(projects.map(deserialize));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: { tasks: { orderBy: { order: 'asc' } }, milestones: true } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(deserialize(project));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const { assignedTeam, ...rest } = parsed.data;
    const project = await prisma.project.create({ data: { ...rest, assignedTeam: JSON.stringify(assignedTeam) } });
    res.status(201).json(deserialize(project));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = projectUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const { assignedTeam, ...rest } = parsed.data;
    const data: any = rest;
    if (assignedTeam !== undefined) data.assignedTeam = JSON.stringify(assignedTeam);
    const project = await prisma.project.update({ where: { id: req.params.id }, data });
    res.json(deserialize(project));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
