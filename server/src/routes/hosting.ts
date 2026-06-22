import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { domainName: { contains: search as string } },
        { clientName: { contains: search as string } },
      ];
    }
    const accounts = await prisma.hostingAccount.findMany({ where, orderBy: { expiryDate: 'asc' } });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hosting accounts' });
  }
});

router.get('/expiring', async (_req: Request, res: Response) => {
  try {
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);
    const accounts = await prisma.hostingAccount.findMany({
      where: { expiryDate: { lte: ninetyDays }, status: 'active' },
      orderBy: { expiryDate: 'asc' },
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expiring accounts' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const account = await prisma.hostingAccount.create({ data: req.body });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hosting account' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const account = await prisma.hostingAccount.update({ where: { id: req.params.id }, data: req.body });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hosting account' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.hostingAccount.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hosting account' });
  }
});

export default router;
