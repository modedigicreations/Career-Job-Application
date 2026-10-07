import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readDb, writeDb } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth-server';

const MANAGEMENT_ROLES = ['managing_director', 'manager', 'super_admin', 'admin', 'administration'];

async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

// GET is intentionally the ONLY way a browser learns about WATI config, and it never
// returns the raw API key — just the URL plus whether a key is already on file.
export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
  }
  const db = readDb();
  return NextResponse.json({
    success: true,
    watiApiUrl: db.integrations?.watiApiUrl || '',
    watiConfigured: !!db.integrations?.watiApiKey
  });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
  }

  const db = readDb();
  const requester = db.users.find((u: any) => u.id === session.userId);
  if (!requester || !MANAGEMENT_ROLES.includes(requester.role)) {
    return NextResponse.json({ success: false, message: 'Only a manager or admin can configure integrations.' }, { status: 403 });
  }

  const { watiApiUrl, watiApiKey } = await request.json();

  const nextIntegrations = { ...db.integrations };
  if (typeof watiApiUrl === 'string') {
    nextIntegrations.watiApiUrl = watiApiUrl.trim().replace(/\/+$/, '');
  }
  // An empty key field means "leave the existing key alone" — the UI never shows the
  // real key back to the user, so there's nothing for them to intentionally blank out.
  if (typeof watiApiKey === 'string' && watiApiKey.trim()) {
    nextIntegrations.watiApiKey = watiApiKey.trim();
  }

  db.integrations = nextIntegrations;
  db.lastUpdated = new Date().toISOString();
  writeDb(db);

  return NextResponse.json({
    success: true,
    watiApiUrl: db.integrations.watiApiUrl || '',
    watiConfigured: !!db.integrations.watiApiKey
  });
}
