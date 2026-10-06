import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// WATI's documented "send session message" API: POST {baseUrl}/api/v1/sendSessionMessage/{phone}?messageText=...
// with `Authorization: Bearer <apiKey>`. No WATI account exists yet to verify this live — this is built
// to spec and ready to use the moment real credentials are added via Settings > Integrations.
router.post('/broadcast', async (req: AuthRequest, res: Response) => {
  try {
    const { phoneNumbers, message } = req.body;
    if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0 || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'phoneNumbers (non-empty array) and message are required' });
    }

    const [baseUrlSetting, apiKeySetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'wati.baseUrl' } }),
      prisma.setting.findUnique({ where: { key: 'wati.apiKey' } }),
    ]);
    const baseUrl = baseUrlSetting?.value;
    const apiKey = apiKeySetting?.value;
    if (!baseUrl || !apiKey) {
      return res.status(400).json({ error: 'WhatsApp (WATI) integration is not configured yet. Add it under Settings > Integrations.' });
    }

    const results = await Promise.all(
      phoneNumbers.map(async (phone: string) => {
        try {
          const url = `${baseUrl.replace(/\/$/, '')}/api/v1/sendSessionMessage/${encodeURIComponent(phone)}?messageText=${encodeURIComponent(message)}`;
          const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` } });
          return { phone, success: response.ok, status: response.status };
        } catch (err: any) {
          return { phone, success: false, error: err.message };
        }
      })
    );

    res.json({ results, sent: results.filter((r) => r.success).length, failed: results.filter((r) => !r.success).length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

export default router;
