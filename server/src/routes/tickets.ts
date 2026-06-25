import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ticketSchema, ticketUpdateSchema } from '../lib/validators';

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
    const parsed = ticketSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const ticket = await prisma.ticket.create({ data: parsed.data });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = ticketUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const ticket = await prisma.ticket.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.ticket.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

export default router;
