import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requisitionSchema } from '../lib/validators';
import { AuthRequest, MANAGER_TIER } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const canViewAll = MANAGER_TIER.includes(req.userRole || '');
    const where: any = canViewAll ? {} : { requestedBy: req.userId };
    if (req.query.status && req.query.status !== 'all') where.status = req.query.status;
    const requisitions = await prisma.requisition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { requester: { select: { id: true, name: true } }, approver: { select: { id: true, name: true } } },
    });
    res.json(requisitions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requisitions' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = requisitionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }
    const requisition = await prisma.requisition.create({
      data: { ...parsed.data, requestedBy: req.userId!, status: 'pending' },
      include: { requester: { select: { id: true, name: true } }, approver: { select: { id: true, name: true } } },
    });
    res.status(201).json(requisition);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create requisition' });
  }
});

async function decide(req: AuthRequest, res: Response, status: 'approved' | 'rejected') {
  try {
    if (!MANAGER_TIER.includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Only a manager or admin can approve or reject requisitions' });
    }
    const existing = await prisma.requisition.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Requisition not found' });
    if (existing.status !== 'pending') return res.status(400).json({ error: 'This requisition has already been decided' });

    const requisition = await prisma.requisition.update({
      where: { id: req.params.id },
      data: { status, approvedBy: req.userId },
      include: { requester: { select: { id: true, name: true } }, approver: { select: { id: true, name: true } } },
    });
    res.json(requisition);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update requisition' });
  }
}

router.patch('/:id/approve', (req: AuthRequest, res: Response) => decide(req, res, 'approved'));
router.patch('/:id/reject', (req: AuthRequest, res: Response) => decide(req, res, 'rejected'));

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.requisition.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Requisition not found' });
    const canManage = MANAGER_TIER.includes(req.userRole || '');
    if (existing.requestedBy !== req.userId && !canManage) {
      return res.status(403).json({ error: 'You do not have permission to delete this requisition' });
    }
    if (existing.status !== 'pending' && !canManage) {
      return res.status(400).json({ error: 'Only a manager or admin can delete a decided requisition' });
    }
    await prisma.requisition.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete requisition' });
  }
});

export default router;
