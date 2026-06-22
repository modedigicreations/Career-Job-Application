import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { subject: { contains: search as string } },
        { clientName: { contains: search as string } },
      ];
    }
    const tickets = await prisma.ticket.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.create({ data: req.body });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.update({ where: { id: req.params.id }, data: req.body });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

export default router;
