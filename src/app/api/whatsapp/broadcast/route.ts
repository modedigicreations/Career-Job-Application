import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readDb } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth-server';

const MAX_RECIPIENTS = 200;

async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

// Nigeria-centric normalization, matching lib/utils.ts's formatWhatsAppUrl convention:
// a local 0-prefixed 11-digit number becomes 234-prefixed.
function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '234' + cleaned.substring(1);
  }
  return cleaned;
}

interface BroadcastResult {
  phone: string;
  success: boolean;
  error?: string;
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
  }

  const db = readDb();
  const watiApiUrl = db.integrations?.watiApiUrl;
  const watiApiKey = db.integrations?.watiApiKey;
  if (!watiApiUrl || !watiApiKey) {
    return NextResponse.json(
      { success: false, message: 'WATI is not configured yet. Add the API URL and key under Settings → WhatsApp Broadcast first.' },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const phoneNumbers: unknown = body?.phoneNumbers;
  const message: unknown = body?.message;

  if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
    return NextResponse.json({ success: false, message: 'At least one phone number is required.' }, { status: 400 });
  }
  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ success: false, message: 'Message text is required.' }, { status: 400 });
  }

  const uniquePhones = Array.from(new Set(
    phoneNumbers.filter((p): p is string => typeof p === 'string' && p.trim().length > 0).map(normalizePhone)
  )).filter(Boolean);

  if (uniquePhones.length === 0) {
    return NextResponse.json({ success: false, message: 'None of the supplied phone numbers were valid.' }, { status: 400 });
  }
  if (uniquePhones.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      { success: false, message: `Too many recipients (${uniquePhones.length}). Split into batches of ${MAX_RECIPIENTS} or fewer.` },
      { status: 400 }
    );
  }

  const results: BroadcastResult[] = await Promise.all(
    uniquePhones.map(async (phone): Promise<BroadcastResult> => {
      try {
        const url = `${watiApiUrl}/api/v1/sendSessionMessage/${phone}?messageText=${encodeURIComponent(message)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { Authorization: watiApiKey, 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          return { phone, success: false, error: `WATI responded ${res.status}${text ? `: ${text.slice(0, 200)}` : ''}` };
        }
        return { phone, success: true };
      } catch (err: any) {
        return { phone, success: false, error: err?.message || 'Network error' };
      }
    })
  );

  const succeeded = results.filter(r => r.success).length;
  return NextResponse.json({
    success: true,
    sent: succeeded,
    failed: results.length - succeeded,
    results
  });
}
