import { Router, Response } from 'express';
import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma';
import { startOfDay } from '../lib/dates';
import { AuthRequest, MANAGER_TIER } from '../middleware/auth';

const router = Router();

router.get('/shift-report', async (req: AuthRequest, res: Response) => {
  try {
    const canViewAll = MANAGER_TIER.includes(req.userRole || '');
    const targetUserId = canViewAll && req.query.userId ? String(req.query.userId) : req.userId;
    if (!targetUserId) return res.status(400).json({ error: 'userId is required' });

    const weekStartParam = req.query.weekStart ? new Date(String(req.query.weekStart)) : new Date();
    const weekStart = startOfDay(weekStartParam);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const user = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, name: true, role: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [summaries, callsAndEmails, projectTasksCompleted, managerTasksCompleted] = await Promise.all([
      prisma.dailySummary.findMany({ where: { userId: targetUserId, date: { gte: weekStart, lt: weekEnd } }, orderBy: { date: 'asc' } }),
      prisma.activity.findMany({ where: { userId: targetUserId, type: { in: ['call', 'email'] }, createdAt: { gte: weekStart, lt: weekEnd } } }),
      prisma.task.count({ where: { assignedTo: targetUserId, status: 'completed', updatedAt: { gte: weekStart, lt: weekEnd } } }),
      prisma.managerTask.count({ where: { assignedTo: targetUserId, status: 'completed', updatedAt: { gte: weekStart, lt: weekEnd } } }),
    ]);

    const callCount = callsAndEmails.filter((a) => a.type === 'call').length;
    const emailCount = callsAndEmails.filter((a) => a.type === 'email').length;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="shift-report-${user.name.replace(/\s+/g, '-')}-${weekStart.toISOString().split('T')[0]}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).text('MODE CRM — End of Shift Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#555').text(`${user.name} (${user.role})`, { align: 'center' });
    doc.text(`Week of ${weekStart.toLocaleDateString('en-GB')} — ${new Date(weekEnd.getTime() - 86400000).toLocaleDateString('en-GB')}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fillColor('#000').fontSize(14).text('Weekly Summary');
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#333');
    doc.text(`Tasks completed: ${projectTasksCompleted + managerTasksCompleted}`);
    doc.text(`Calls made: ${callCount}`);
    doc.text(`Emails sent: ${emailCount}`);
    doc.moveDown(1);

    doc.fillColor('#000').fontSize(14).text('Daily Summary Notes');
    doc.moveDown(0.3);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const entry = summaries.find((s) => startOfDay(new Date(s.date)).getTime() === day.getTime());

      doc.fontSize(11).fillColor('#111').text(`${dayNames[day.getDay()]}, ${day.toLocaleDateString('en-GB')}`, { continued: false });
      doc.fontSize(10).fillColor('#555').text(entry ? entry.note : 'No note recorded', { indent: 15 });
      doc.moveDown(0.6);
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate shift report' });
  }
});

export default router;
