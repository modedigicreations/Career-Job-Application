import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { campaignSchema, campaignUpdateSchema } from '../lib/validators';

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
    const parsed = campaignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const campaign = await prisma.emailCampaign.create({ data: parsed.data });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = campaignUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const campaign = await prisma.emailCampaign.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.emailCampaign.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router;
