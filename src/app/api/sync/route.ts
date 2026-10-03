import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { broadcastSyncEvent } from '@/lib/sync-events';
import {
  initialServices,
  initialProfiles,
  initialShiftTasks,
  initialMemos,
  initialLeads,
  initialProjects,
  initialInvoices,
  initialRequisitions,
  initialCompanies,
  initialContacts,
  initialHostingAccounts,
  initialTasks
} from '@/lib/seed-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'mode-ops-db.json');

interface ServerState {
  services: any[];
  servicesLastUpdated?: string;
  shifts: any[];
  shiftsLastUpdated?: string;
  users: any[];
  usersLastUpdated?: string;
  shiftTasks: any[];
  shiftTasksLastUpdated?: string;
  memos: any[];
  memosLastUpdated?: string;
  leads: any[];
  leadsLastUpdated?: string;
  projects: any[];
  projectsLastUpdated?: string;
  invoices: any[];
  invoicesLastUpdated?: string;
  requisitions: any[];
  requisitionsLastUpdated?: string;
  companies: any[];
  contacts: any[];
  hostingAccounts: any[];
  tasks: any[];
  lastUpdated: string;
}

function getInitialDbState(): ServerState {
  return {
    services: initialServices.map(s => ({ ...s, currency: 'NGN' })),
    servicesLastUpdated: new Date().toISOString(),
    shifts: [],
    shiftsLastUpdated: new Date().toISOString(),
    users: initialProfiles,
    usersLastUpdated: new Date().toISOString(),
    shiftTasks: initialShiftTasks,
    shiftTasksLastUpdated: new Date().toISOString(),
    memos: initialMemos,
    memosLastUpdated: new Date().toISOString(),
    leads: initialLeads.map(l => ({ ...l, currency: 'NGN' })),
    projects: initialProjects.map(p => ({ ...p, currency: 'NGN' })),
    invoices: initialInvoices.map(i => ({ ...i, currency: 'NGN' })),
    requisitions: initialRequisitions.map(r => ({ ...r, currency: 'NGN' })),
    companies: initialCompanies,
    contacts: initialContacts,
    hostingAccounts: initialHostingAccounts.map(h => ({ ...h, currency: 'NGN' })),
    tasks: initialTasks,
    lastUpdated: new Date().toISOString()
  };
}

function readDb(): ServerState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      const initial = getInitialDbState();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      ...getInitialDbState(),
      ...parsed,
      users: (parsed.users && Array.isArray(parsed.users) && parsed.users.length > 0)
        ? parsed.users
        : initialProfiles,
      services: (parsed.services && Array.isArray(parsed.services) && parsed.services.length > 0)
        ? parsed.services.map((s: any) => ({ ...s, currency: 'NGN' }))
        : initialServices.map(s => ({ ...s, currency: 'NGN' })),
      shifts: (parsed.shifts && Array.isArray(parsed.shifts))
        ? parsed.shifts
        : [],
      shiftTasks: Array.isArray(parsed.shiftTasks)
        ? parsed.shiftTasks
        : initialShiftTasks,
      memos: Array.isArray(parsed.memos)
        ? parsed.memos
        : initialMemos,
      leads: Array.isArray(parsed.leads)
        ? parsed.leads.map((l: any) => ({ ...l, currency: 'NGN' }))
        : initialLeads.map(l => ({ ...l, currency: 'NGN' })),
      projects: Array.isArray(parsed.projects)
        ? parsed.projects.map((p: any) => ({ ...p, currency: 'NGN' }))
        : initialProjects.map(p => ({ ...p, currency: 'NGN' })),
      invoices: Array.isArray(parsed.invoices)
        ? parsed.invoices.map((i: any) => ({ ...i, currency: 'NGN' }))
        : initialInvoices.map(i => ({ ...i, currency: 'NGN' })),
      requisitions: Array.isArray(parsed.requisitions)
        ? parsed.requisitions.map((r: any) => ({ ...r, currency: 'NGN' }))
        : initialRequisitions.map(r => ({ ...r, currency: 'NGN' })),
      hostingAccounts: Array.isArray(parsed.hostingAccounts)
        ? parsed.hostingAccounts.map((h: any) => ({ ...h, currency: 'NGN' }))
        : initialHostingAccounts.map(h => ({ ...h, currency: 'NGN' })),
    };
  } catch (err) {
    console.error('[API /api/sync] Error reading DB:', err);
    return getInitialDbState();
  }
}

function writeDb(state: ServerState): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[API /api/sync] Error writing DB:', err);
    return false;
  }
}

export async function GET() {
  const state = readDb();
  return NextResponse.json({
    success: true,
    data: state,
    timestamp: state.lastUpdated
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = readDb();
    const nowIso = new Date().toISOString();

    // 1. Delta / Patch Sync Optimization
    if (body.delta && body.delta.entity) {
      const { entity, action, item, id } = body.delta;
      const targetList = Array.isArray((current as any)[entity]) ? [...(current as any)[entity]] : [];
      
      if (action === 'delete') {
        const deleteId = id || item?.id;
        (current as any)[entity] = targetList.filter((x: any) => x.id !== deleteId);
      } else if (action === 'upsert' && item && item.id) {
        const existingIdx = targetList.findIndex((x: any) => x.id === item.id);
        if (existingIdx !== -1) {
          targetList[existingIdx] = { ...targetList[existingIdx], ...item };
        } else {
          targetList.unshift(item);
        }
        (current as any)[entity] = targetList;
      }

      const entityTimestamp = body.timestamp || nowIso;
      (current as any)[`${entity}LastUpdated`] = entityTimestamp;
      current.lastUpdated = nowIso;
      writeDb(current);

      // Broadcast delta event immediately to connected SSE clients
      broadcastSyncEvent({
        type: 'delta',
        entity,
        action,
        item,
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
    let updatedEntity: string = 'all';
    if (body.entity && body.data !== undefined) {
      updatedEntity = body.entity;
      (current as any)[body.entity] = body.data;
      (current as any)[`${body.entity}LastUpdated`] = body.timestamp || nowIso;
    } else if (body.partialState && typeof body.partialState === 'object') {
      Object.assign(current, body.partialState);
    } else if (body.services && Array.isArray(body.services)) {
      updatedEntity = 'services';
      current.services = body.services.map((s: any) => ({ ...s, currency: s.currency || 'NGN' }));
      current.servicesLastUpdated = nowIso;
    }

    current.lastUpdated = nowIso;
    writeDb(current);

    // Broadcast snapshot event immediately to connected SSE clients
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
