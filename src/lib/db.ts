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
  initialTasks,
  initialPayments,
  initialTickets,
  initialGoals,
  initialFeedbacks,
  initialPayrollRecords
} from '@/lib/seed-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'mode-ops-db.json');

export interface ServerState {
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
  payments: any[];
  paymentsLastUpdated?: string;
  tickets: any[];
  ticketsLastUpdated?: string;
  goals: any[];
  goalsLastUpdated?: string;
  feedbacks: any[];
  feedbacksLastUpdated?: string;
  payrollRecords: any[];
  payrollRecordsLastUpdated?: string;
  lastUpdated: string;
}

export function getInitialDbState(): ServerState {
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
    requisitionsLastUpdated: new Date().toISOString(),
    companies: initialCompanies,
    contacts: initialContacts,
    hostingAccounts: initialHostingAccounts.map(h => ({ ...h, currency: 'NGN' })),
    tasks: initialTasks,
    payments: initialPayments.map(p => ({ ...p, currency: 'NGN' })),
    paymentsLastUpdated: new Date().toISOString(),
    tickets: initialTickets,
    ticketsLastUpdated: new Date().toISOString(),
    goals: initialGoals,
    goalsLastUpdated: new Date().toISOString(),
    feedbacks: initialFeedbacks,
    feedbacksLastUpdated: new Date().toISOString(),
    payrollRecords: initialPayrollRecords.map(p => ({ ...p, currency: 'NGN' })),
    payrollRecordsLastUpdated: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
}

export function readDb(): ServerState {
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
      payments: Array.isArray(parsed.payments)
        ? parsed.payments.map((p: any) => ({ ...p, currency: 'NGN' }))
        : initialPayments.map(p => ({ ...p, currency: 'NGN' })),
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : initialTickets,
      goals: Array.isArray(parsed.goals) ? parsed.goals : initialGoals,
      feedbacks: Array.isArray(parsed.feedbacks) ? parsed.feedbacks : initialFeedbacks,
      payrollRecords: Array.isArray(parsed.payrollRecords)
        ? parsed.payrollRecords.map((p: any) => ({ ...p, currency: 'NGN' }))
        : initialPayrollRecords.map(p => ({ ...p, currency: 'NGN' })),
    };
  } catch (err) {
    console.error('[db] Error reading DB:', err);
    return getInitialDbState();
  }
}

export function writeDb(state: ServerState): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[db] Error writing DB:', err);
    return false;
  }
}
