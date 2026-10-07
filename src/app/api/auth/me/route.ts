import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readDb } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth-server';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.id === session.userId);
  if (!user || user.is_active === false) {
    return NextResponse.json({ success: false, message: 'Account not found or deactivated.' }, { status: 401 });
  }

  const { password, ...safe } = user;
  return NextResponse.json({ success: true, user: safe });
}
