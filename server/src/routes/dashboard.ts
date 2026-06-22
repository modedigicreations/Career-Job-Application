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
      paidInvoices,
      openTickets,
      hostingAccounts,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: { notIn: ['won', 'lost'] } } }),
      prisma.lead.count({ where: { status: 'won' } }),
      prisma.project.count({ where: { status: 'in-progress' } }),
      prisma.invoice.count(),
      prisma.invoice.findMany({ where: { status: 'paid' } }),
      prisma.ticket.count({ where: { status: { in: ['open', 'in-progress'] } } }),
      prisma.hostingAccount.count({ where: { status: 'active' } }),
    ]);

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const outstandingInvoices = await prisma.invoice.findMany({
      where: { status: { in: ['sent', 'partially-paid', 'overdue'] } },
    });
    const outstanding = outstandingInvoices.reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0);

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
        const leads = await prisma.lead.findMany({ where: { status: stage } });
        return {
          stage,
          count: leads.length,
          value: leads.reduce((sum, l) => sum + l.estimatedValue, 0),
        };
      })
    );
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pipeline data' });
  }
});

export default router;
