import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { invoiceCreateSchema, invoiceUpdateSchema } from '../lib/validators';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { clientName: { contains: search as string } },
        { invoiceNumber: { contains: search as string } },
      ];
    }
    const invoices = await prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' }, include: { payments: true } });
    res.json(invoices.map((i) => {
      try { return { ...i, items: JSON.parse(i.items) }; }
      catch { return { ...i, items: [] }; }
    }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id }, include: { payments: true } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    let parsedItems = [];
    try { parsedItems = JSON.parse(invoice.items); } catch {}
    res.json({ ...invoice, items: parsedItems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = invoiceCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const { items, ...rest } = parsed.data;

    const invoice = await prisma.$transaction(async (tx) => {
      const lastInvoice = await tx.invoice.findFirst({
        where: { invoiceNumber: { startsWith: `INV-${new Date().getFullYear()}-` } },
        orderBy: { invoiceNumber: 'desc' },
      });
      let nextNum = 1;
      if (lastInvoice) {
        const match = lastInvoice.invoiceNumber.match(/INV-\d+-(\d+)/);
        if (match) nextNum = parseInt(match[1], 10) + 1;
      }
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;

      return tx.invoice.create({
        data: { ...rest, invoiceNumber, items: JSON.stringify(items) },
      });
    });

    res.status(201).json({ ...invoice, items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = invoiceUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const { items, ...rest } = parsed.data;
    const data: any = rest;
    if (items) data.items = JSON.stringify(items);
    const invoice = await prisma.invoice.update({ where: { id: req.params.id }, data });
    let parsedItems = [];
    try { parsedItems = JSON.parse(invoice.items); } catch {}
    res.json({ ...invoice, items: parsedItems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
