import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

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

    res.json({
      totalLeads,
      activeLeads,
      wonLeads,
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

export default router;
