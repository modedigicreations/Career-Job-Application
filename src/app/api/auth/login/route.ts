import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { createSessionToken, verifyPassword, hashPassword, isHashedPassword, SESSION_COOKIE } from '@/lib/auth-server';
import { broadcastSyncEvent } from '@/lib/sync-events';

function sanitizeUser(user: any) {
  const { password, ...safe } = user;
  return safe;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isCompanyDomain =
      cleanEmail.endsWith('@modedigitalcreations.ng') ||
      cleanEmail.endsWith('@modewebhost.com.ng');
    if (!isCompanyDomain) {
      return NextResponse.json(
        { success: false, message: 'Access Restricted: Only official @modedigitalcreations.ng and @modewebhost.com.ng company email addresses are allowed.' },
        { status: 403 }
      );
    }

    const db = readDb();
    const userIndex = db.users.findIndex((u: any) => u.email.toLowerCase() === cleanEmail);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'No registered staff profile found with this company email yet. Contact an administrator to be added.' },
        { status: 401 }
      );
    }

    const matchedUser = db.users[userIndex];
    if (matchedUser.is_active === false) {
      return NextResponse.json(
        { success: false, message: 'This staff account has been deactivated. Please reach out to your administrator.' },
        { status: 403 }
      );
    }

    const validPassword = await verifyPassword(password, matchedUser.password);
    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password. If you\'re signed in elsewhere you can change it from Settings, or ask a manager/admin to reset it from Staff Allocation.' },
        { status: 401 }
      );
    }

    // Transparent migration: if this account's password was still the legacy plaintext
    // value, re-hash it now that we know it's correct, so it's never stored in the clear again.
    const nowIso = new Date().toISOString();
    if (!isHashedPassword(matchedUser.password)) {
      matchedUser.password = await hashPassword(password);
    }
    matchedUser.last_login = nowIso;
    db.users[userIndex] = matchedUser;
    db.usersLastUpdated = nowIso;
    db.lastUpdated = nowIso;
    writeDb(db);
    broadcastSyncEvent({ type: 'delta', entity: 'users', action: 'upsert', item: sanitizeUser(matchedUser), id: matchedUser.id, timestamp: nowIso });

    const token = createSessionToken(matchedUser.id);
    const response = NextResponse.json({ success: true, user: sanitizeUser(matchedUser) });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (err) {
    console.error('[api/auth/login] error:', err);
    return NextResponse.json({ success: false, message: 'Login failed. Please try again.' }, { status: 500 });
  }
}
