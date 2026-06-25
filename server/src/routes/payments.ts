import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { paymentSchema } from '../lib/validators';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.query;
    const where: any = {};
    if (invoiceId) where.invoiceId = invoiceId;
    const payments = await prisma.payment.findMany({ where, orderBy: { date: 'desc' } });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = paymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const { invoiceId, amount, currency, method, reference, notes } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw new Error('Invoice not found');

      const balance = invoice.total - invoice.amountPaid;
      if (amount > balance) throw new Error('Payment amount exceeds outstanding balance');

      const payment = await tx.payment.create({
        data: { invoiceId, amount, currency: currency || invoice.currency, method, reference, notes },
      });

      const newAmountPaid = invoice.amountPaid + amount;
      const newStatus = newAmountPaid >= invoice.total ? 'paid' : 'partially-paid';
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { amountPaid: newAmountPaid, status: newStatus },
      });

      return payment;
    });

    res.status(201).json(result);
  } catch (error: any) {
    const message = error.message || 'Failed to record payment';
    const status = message.includes('not found') ? 404 : message.includes('exceeds') ? 400 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
