import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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
  memos: any[];
  leads: any[];
  projects: any[];
  invoices: any[];
  requisitions: any[];
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
    memos: initialMemos,
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
      leads: (parsed.leads && parsed.leads.length > 0)
        ? parsed.leads.map((l: any) => ({ ...l, currency: 'NGN' }))
        : initialLeads.map(l => ({ ...l, currency: 'NGN' })),
      projects: (parsed.projects && parsed.projects.length > 0)
        ? parsed.projects.map((p: any) => ({ ...p, currency: 'NGN' }))
        : initialProjects.map(p => ({ ...p, currency: 'NGN' })),
      invoices: (parsed.invoices && parsed.invoices.length > 0)
        ? parsed.invoices.map((i: any) => ({ ...i, currency: 'NGN' }))
        : initialInvoices.map(i => ({ ...i, currency: 'NGN' })),
      requisitions: Array.isArray(parsed.requisitions)
        ? parsed.requisitions.map((r: any) => ({ ...r, currency: 'NGN' }))
        : initialRequisitions.map(r => ({ ...r, currency: 'NGN' })),
      hostingAccounts: (parsed.hostingAccounts && parsed.hostingAccounts.length > 0)
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

    // Support updating single entity or multiple entities
    if (body.entity && body.data !== undefined) {
      (current as any)[body.entity] = body.data;
      (current as any)[`${body.entity}LastUpdated`] = body.timestamp || new Date().toISOString();
    } else if (body.partialState && typeof body.partialState === 'object') {
      Object.assign(current, body.partialState);
    } else if (body.services && Array.isArray(body.services)) {
      current.services = body.services.map((s: any) => ({ ...s, currency: s.currency || 'NGN' }));
      current.servicesLastUpdated = new Date().toISOString();
    }

    current.lastUpdated = new Date().toISOString();
    writeDb(current);

    return NextResponse.json({
      success: true,
      lastUpdated: current.lastUpdated,
      entity: body.entity || 'all'
    });
  } catch (err: any) {
    console.error('[API /api/sync] POST error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update server state' },
      { status: 500 }
    );
  }
}
