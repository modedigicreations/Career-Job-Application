import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const campaigns = await prisma.emailCampaign.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.emailCampaign.create({ data: req.body });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.emailCampaign.update({ where: { id: req.params.id }, data: req.body });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

export default router;
