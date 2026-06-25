import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { companySchema, companyUpdateSchema } from '../lib/validators';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { industry: { contains: search as string } },
      ];
    }
    const companies = await prisma.company.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = companySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const company = await prisma.company.create({ data: parsed.data });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create company' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = companyUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const company = await prisma.company.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update company' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.company.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

export default router;
