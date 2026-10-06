import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [
      totalLeads,
      activeLeads,
      wonLeads,
      activeProjects,
      totalInvoices,
      paidRevenue,
      outstandingData,
      openTickets,
      hostingAccounts,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: { notIn: ['won', 'lost'] } } }),
      prisma.lead.count({ where: { status: 'won' } }),
      prisma.project.count({ where: { status: 'in-progress' } }),
      prisma.invoice.count(),
      prisma.invoice.aggregate({
        where: { status: 'paid' },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { status: { in: ['sent', 'partially-paid', 'overdue'] } },
        _sum: { total: true, amountPaid: true },
      }),
      prisma.ticket.count({ where: { status: { in: ['open', 'in-progress'] } } }),
      prisma.hostingAccount.count({ where: { status: 'active' } }),
    ]);

    const totalRevenue = paidRevenue._sum.total || 0;
    const outstanding = (outstandingData._sum.total || 0) - (outstandingData._sum.amountPaid || 0);
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 1000) / 10 : 0;

    res.json({
      totalLeads,
      activeLeads,
      wonLeads,
      conversionRate,
      totalRevenue,
      outstanding,
      activeProjects,
      totalInvoices,
      openTickets,
      hostingAccounts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.get('/pipeline', async (_req: Request, res: Response) => {
  try {
    const stages = ['new-lead', 'qualified', 'contacted', 'discovery-call', 'proposal-sent', 'negotiation', 'won', 'lost'];
    const pipeline = await Promise.all(
      stages.map(async (stage) => {
        const result = await prisma.lead.aggregate({
          where: { status: stage },
          _count: true,
          _sum: { estimatedValue: true },
        });
        return {
          stage,
          count: result._count,
          value: result._sum.estimatedValue || 0,
        };
      })
    );
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pipeline data' });
  }
});

// Company-wide profit/loss breakdown — restricted to super-admin only.
router.get('/financials', requireRole('super-admin'), async (req: Request, res: Response) => {
  try {
    const granularity = req.query.granularity === 'month' ? 'month' : 'day';
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();
    const from = req.query.from
      ? new Date(String(req.query.from))
      : new Date(new Date().setFullYear(to.getFullYear() - 1));

    const [payments, requisitions] = await Promise.all([
      prisma.payment.findMany({ where: { date: { gte: from, lte: to } }, select: { amount: true, date: true } }),
      prisma.requisition.findMany({ where: { status: 'approved', date: { gte: from, lte: to } }, select: { amount: true, date: true } }),
    ]);

    const bucketKey = (d: Date) =>
      granularity === 'month'
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        : d.toISOString().split('T')[0];

    const buckets = new Map<string, { revenue: number; expenses: number }>();
    payments.forEach((p) => {
      const key = bucketKey(new Date(p.date));
      const bucket = buckets.get(key) || { revenue: 0, expenses: 0 };
      bucket.revenue += p.amount;
      buckets.set(key, bucket);
    });
    requisitions.forEach((r) => {
      const key = bucketKey(new Date(r.date));
      const bucket = buckets.get(key) || { revenue: 0, expenses: 0 };
      bucket.expenses += r.amount;
      buckets.set(key, bucket);
    });

    const breakdown = Array.from(buckets.entries())
      .map(([period, v]) => ({ period, revenue: v.revenue, expenses: v.expenses, profit: v.revenue - v.expenses }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const totalRevenue = breakdown.reduce((s, b) => s + b.revenue, 0);
    const totalExpenses = breakdown.reduce((s, b) => s + b.expenses, 0);

    res.json({ granularity, from, to, breakdown, totalRevenue, totalExpenses, totalProfit: totalRevenue - totalExpenses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial breakdown' });
  }
});

export default router;
