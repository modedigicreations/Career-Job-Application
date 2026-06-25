import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { contactSchema, contactUpdateSchema } from '../lib/validators';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { company: { contains: search as string } },
      ];
    }
    const contacts = await prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const contact = await prisma.contact.create({ data: parsed.data });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = contactUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const contact = await prisma.contact.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default router;
