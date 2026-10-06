import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import { authenticateToken } from './middleware/auth';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import leadRoutes from './routes/leads';
import contactRoutes from './routes/contacts';
import companyRoutes from './routes/companies';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import serviceRoutes from './routes/services';
import hostingRoutes from './routes/hosting';
import invoiceRoutes from './routes/invoices';
import paymentRoutes from './routes/payments';
import ticketRoutes from './routes/tickets';
import activityRoutes from './routes/activities';
import campaignRoutes from './routes/campaigns';
import dashboardRoutes from './routes/dashboard';
import goalRoutes from './routes/goals';
import managerTaskRoutes from './routes/manager-tasks';
import dailySummaryRoutes from './routes/daily-summaries';
import reportRoutes from './routes/reports';
import requisitionRoutes from './routes/requisitions';
import settingsRoutes from './routes/settings';
import whatsappRoutes from './routes/whatsapp';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'MODE CRM API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);

app.use('/api/leads', authenticateToken, leadRoutes);
app.use('/api/contacts', authenticateToken, contactRoutes);
app.use('/api/companies', authenticateToken, companyRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/services', authenticateToken, serviceRoutes);
app.use('/api/hosting', authenticateToken, hostingRoutes);
app.use('/api/invoices', authenticateToken, invoiceRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/tickets', authenticateToken, ticketRoutes);
app.use('/api/activities', authenticateToken, activityRoutes);
app.use('/api/campaigns', authenticateToken, campaignRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/goals', authenticateToken, goalRoutes);
app.use('/api/manager-tasks', authenticateToken, managerTaskRoutes);
app.use('/api/daily-summaries', authenticateToken, dailySummaryRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/requisitions', authenticateToken, requisitionRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);
app.use('/api/whatsapp', authenticateToken, whatsappRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`MODE CRM API running on http://localhost:${PORT}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;
