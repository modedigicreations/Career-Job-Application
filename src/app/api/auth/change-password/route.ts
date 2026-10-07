import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readDb, writeDb } from '@/lib/db';
import { verifySessionToken, hashPassword, verifyPassword, SESSION_COOKIE } from '@/lib/auth-server';
import { broadcastSyncEvent } from '@/lib/sync-events';

const MANAGEMENT_ROLES = ['managing_director', 'manager', 'super_admin', 'admin', 'administration'];

function sanitizeUser(user: any) {
  const { password, ...safe } = user;
  return safe;
}

// Self-service (any authenticated user, their own password) or an admin resetting
// someone else's (management-tier role required) — never reachable unauthenticated,
// unlike the old client-only changeUserPassword(email, newPassword) it replaces.
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }

    const { newPassword, targetUserId, currentPassword } = await request.json();
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    const db = readDb();
    const requester = db.users.find((u: any) => u.id === session.userId);
    if (!requester) {
      return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 401 });
    }

    const effectiveTargetId = targetUserId || session.userId;
    const isSelf = effectiveTargetId === session.userId;
    if (!isSelf && !MANAGEMENT_ROLES.includes(requester.role)) {
      return NextResponse.json({ success: false, message: 'Only a manager or admin can reset another user\'s password.' }, { status: 403 });
    }

    // Changing your own password still requires proving you know the current one — an
    // open/unattended session shouldn't be enough on its own to take over the account.
    // An admin resetting someone ELSE's password is a deliberate override and skips this.
    if (isSelf) {
      const validCurrent = await verifyPassword(typeof currentPassword === 'string' ? currentPassword : '', requester.password);
      if (!validCurrent) {
        return NextResponse.json({ success: false, message: 'Current password is incorrect.' }, { status: 401 });
      }
    }

    const targetIndex = db.users.findIndex((u: any) => u.id === effectiveTargetId);
    if (targetIndex === -1) {
      return NextResponse.json({ success: false, message: 'Target user not found.' }, { status: 404 });
    }

    const nowIso = new Date().toISOString();
    db.users[targetIndex] = { ...db.users[targetIndex], password: await hashPassword(newPassword) };
    db.usersLastUpdated = nowIso;
    db.lastUpdated = nowIso;
    writeDb(db);
    broadcastSyncEvent({ type: 'delta', entity: 'users', action: 'upsert', item: sanitizeUser(db.users[targetIndex]), id: effectiveTargetId, timestamp: nowIso });

    return NextResponse.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[api/auth/change-password] error:', err);
    return NextResponse.json({ success: false, message: 'Failed to change password.' }, { status: 500 });
  }
}
