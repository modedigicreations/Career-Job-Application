import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
    res.json(services.map((s) => ({ ...s, features: JSON.parse(s.features) })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ ...service, features: JSON.parse(service.features) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { features, ...rest } = req.body;
    const service = await prisma.service.create({ data: { ...rest, features: JSON.stringify(features || []) } });
    res.status(201).json({ ...service, features: JSON.parse(service.features) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { features, ...rest } = req.body;
    const data: any = rest;
    if (features) data.features = JSON.stringify(features);
    const service = await prisma.service.update({ where: { id: req.params.id }, data });
    res.json({ ...service, features: JSON.parse(service.features) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
