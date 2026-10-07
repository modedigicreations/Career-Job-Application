import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readDb, writeDb } from '@/lib/db';
import { broadcastSyncEvent } from '@/lib/sync-events';
import { verifySessionToken, hashPassword, isHashedPassword, SESSION_COOKIE } from '@/lib/auth-server';

async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

function sanitizeUsers(users: any[]) {
  return users.map(({ password, ...safe }) => safe);
}

// Never let the WATI API key reach a browser — every authenticated user hits this
// endpoint, not just management, so the raw secret can't ride along in the snapshot.
function sanitizeIntegrations(integrations: { watiApiUrl?: string; watiApiKey?: string } | undefined) {
  return {
    watiApiUrl: integrations?.watiApiUrl || '',
    watiConfigured: !!integrations?.watiApiKey
  };
}

// Defense in depth: if a client ever sends a plaintext password in a `users` write
// (e.g. the staff roster's add/edit form), hash it before it touches disk — never
// trust the write path alone to have done this.
async function hashAnyPlaintextPasswords(users: any[]) {
  return Promise.all(
    users.map(async (u) => {
      if (u.password && !isHashedPassword(u.password)) {
        return { ...u, password: await hashPassword(u.password) };
      }
      return u;
    })
  );
}

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const state = readDb();
  return NextResponse.json({
    success: true,
    data: { ...state, users: sanitizeUsers(state.users), integrations: sanitizeIntegrations(state.integrations) },
    timestamp: state.lastUpdated
  });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const current = readDb();
    const nowIso = new Date().toISOString();

    // 1. Delta / Patch Sync Optimization
    if (body.delta && body.delta.entity && body.delta.entity !== 'integrations') {
      const { entity, action, item, id } = body.delta;
      const targetList = Array.isArray((current as any)[entity]) ? [...(current as any)[entity]] : [];

      if (action === 'delete') {
        const deleteId = id || item?.id;
        (current as any)[entity] = targetList.filter((x: any) => x.id !== deleteId);
      } else if (action === 'upsert' && item && item.id) {
        let nextItem = item;
        if (entity === 'users' && item.password && !isHashedPassword(item.password)) {
          nextItem = { ...item, password: await hashPassword(item.password) };
        }
        const existingIdx = targetList.findIndex((x: any) => x.id === nextItem.id);
        if (existingIdx !== -1) {
          targetList[existingIdx] = { ...targetList[existingIdx], ...nextItem };
        } else {
          targetList.unshift(nextItem);
        }
        (current as any)[entity] = targetList;
      }

      const entityTimestamp = body.timestamp || nowIso;
      (current as any)[`${entity}LastUpdated`] = entityTimestamp;
      current.lastUpdated = nowIso;
      writeDb(current);

      let broadcastItem = item;
      if (entity === 'users' && action !== 'delete') {
        const stored = (current as any)[entity].find((x: any) => x.id === (id || item?.id));
        if (stored) {
          const { password, ...safe } = stored;
          broadcastItem = safe;
        }
      }
      broadcastSyncEvent({
        type: 'delta',
        entity,
        action,
        item: broadcastItem,
        id: id || item?.id,
        timestamp: entityTimestamp
      });

      return NextResponse.json({
        success: true,
        mode: 'delta',
        entity,
        action,
        lastUpdated: current.lastUpdated
      });
    }

    // 2. Full Snapshot Entity Update
    // `integrations` (holds the WATI API key) is deliberately excluded from this generic,
    // any-authenticated-user-writable path — it can only be changed via the role-gated
    // /api/settings/integrations route.
    let updatedEntity: string = 'all';
    if (body.entity && body.entity !== 'integrations' && body.data !== undefined) {
      updatedEntity = body.entity;
      (current as any)[body.entity] = body.entity === 'users' && Array.isArray(body.data)
        ? await hashAnyPlaintextPasswords(body.data)
        : body.data;
      (current as any)[`${body.entity}LastUpdated`] = body.timestamp || nowIso;
    } else if (body.partialState && typeof body.partialState === 'object') {
      if (body.partialState.users && Array.isArray(body.partialState.users)) {
        body.partialState.users = await hashAnyPlaintextPasswords(body.partialState.users);
      }
      delete body.partialState.integrations;
      Object.assign(current, body.partialState);
    } else if (body.services && Array.isArray(body.services)) {
      updatedEntity = 'services';
      current.services = body.services.map((s: any) => ({ ...s, currency: s.currency || 'NGN' }));
      current.servicesLastUpdated = nowIso;
    }

    current.lastUpdated = nowIso;
    writeDb(current);

    broadcastSyncEvent({
      type: 'snapshot',
      entity: updatedEntity,
      timestamp: current.lastUpdated
    });

    return NextResponse.json({
      success: true,
      mode: 'snapshot',
      lastUpdated: current.lastUpdated,
      entity: updatedEntity
    });
  } catch (err: any) {
    console.error('[API /api/sync] POST error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update server state' },
      { status: 500 }
    );
  }
}
