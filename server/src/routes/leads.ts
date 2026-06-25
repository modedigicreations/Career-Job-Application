import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { leadSchema, leadUpdateSchema } from '../lib/validators';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, source, search } = req.query;
    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (source && source !== 'all') where.source = source;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { company: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }
    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, include: { assignedUser: { select: { id: true, name: true } } } });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id }, include: { assignedUser: { select: { id: true, name: true } } } });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const lead = await prisma.lead.create({ data: parsed.data });
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = leadUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const lead = await prisma.lead.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

export default router;
