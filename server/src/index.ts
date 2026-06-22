import express from 'express';
import cors from 'cors';
import { authenticateToken } from './middleware/auth';
import authRoutes from './routes/auth';
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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'MODE CRM API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);

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

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`MODE CRM API running on http://localhost:${PORT}`);
});

export default app;
