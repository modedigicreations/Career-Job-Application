import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

router.get('/integrations', requireRole('admin', 'super-admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const [baseUrl, apiKey] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'wati.baseUrl' } }),
      prisma.setting.findUnique({ where: { key: 'wati.apiKey' } }),
    ]);
    res.json({ baseUrl: baseUrl?.value || '', hasApiKey: !!apiKey?.value });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integration settings' });
  }
});

router.put('/integrations', requireRole('admin', 'super-admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { baseUrl, apiKey } = req.body;
    if (typeof baseUrl !== 'string') {
      return res.status(400).json({ error: 'baseUrl is required' });
    }
    await prisma.setting.upsert({ where: { key: 'wati.baseUrl' }, update: { value: baseUrl }, create: { key: 'wati.baseUrl', value: baseUrl } });
    if (typeof apiKey === 'string' && apiKey.trim()) {
      await prisma.setting.upsert({ where: { key: 'wati.apiKey' }, update: { value: apiKey.trim() }, create: { key: 'wati.apiKey', value: apiKey.trim() } });
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save integration settings' });
  }
});

export default router;
