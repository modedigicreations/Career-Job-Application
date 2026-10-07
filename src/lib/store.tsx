'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {
  UserProfile, Lead, Contact, Company, Project, Task, Service, HostingAccount,
  Invoice, Payment, Ticket, ActivityItem, Requisition, Goal, Feedback, AppNotification,
  UserRole, LeadStatus, RequisitionStatus, GoalStatus, WhmcsConfig, PayrollRecord,
  StaffShift, StaffMemo, ShiftTask, Currency
} from './types';
import {
  initialProfiles, initialLeads, initialContacts, initialCompanies,
  initialProjects, initialTasks, initialServices, initialHostingAccounts,
  initialInvoices, initialPayments, initialRequisitions, initialGoals,
  initialFeedbacks, initialTickets, initialActivities, initialNotifications,
  initialPayrollRecords, initialShifts, initialMemos, initialShiftTasks
} from './seed-data';
import { generateReceiptNumber, canAssignTo } from './utils';
import { initStorage, setStorageItem } from './storage';

interface AppContextType {
  // Authentication & Shift Attendance
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  changeUserPassword: (newPassword: string, targetUserId?: string, currentPassword?: string) => Promise<{ success: boolean; message: string }>;
  shifts: StaffShift[];
  activeShift: StaffShift | null;
  clockOutStaff: (shiftId: string, customHours?: number, notes?: string) => void;
  clockInStaff: (staffId: string) => void;
  applyShiftHoursToPayroll: (staffId: string, period?: string) => { hours: number; amount: number };

  // Current active user
  currentUser: UserProfile;
  users: UserProfile[];
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => void;
  addUserProfile: (profile: Omit<UserProfile, 'id'>) => void;
  deleteUserProfile: (id: string) => void;

  // Read-only "View As" — lets a super-admin (anyone) or manager (own direct reports
  // only) preview a staff member's dashboard exactly as it renders for that role,
  // without actually authenticating as them. currentUser never changes; effectiveUser
  // is what role-aware nav/personalization should read.
  viewAsUser: UserProfile | null;
  effectiveUser: UserProfile;
  setViewAsUser: (userId: string | null) => { success: boolean; message?: string };

  // CRM
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  tasks: Task[];
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Daily Shift Task Checklist
  shiftTasks: ShiftTask[];
  addShiftTask: (task: Omit<ShiftTask, 'id' | 'createdAt'>) => ShiftTask;
  toggleShiftTask: (id: string) => void;
  updateShiftTask: (id: string, updates: Partial<ShiftTask>) => void;
  deleteShiftTask: (id: string) => void;
  moveShiftTaskToNextDay: (id: string, nextDate?: string) => void;
  completeShiftReview: (params: {
    staffId: string;
    shiftId?: string;
    completedTaskIds: string[];
    reviewNotes?: string;
  }) => { accomplishedCount: number; carriedForwardCount: number };
  shiftReviewModalOpen: boolean;
  setShiftReviewModalOpen: (open: boolean) => void;
  resumeShiftModalOpen: boolean;
  setResumeShiftModalOpen: (open: boolean) => void;

  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  hostingAccounts: HostingAccount[];
  renewHosting: (id: string, additionalMonths?: number) => void;
  whmcsConfig: import('./types').WhmcsConfig;
  updateWhmcsConfig: (updates: Partial<import('./types').WhmcsConfig>) => void;
  syncWhmcsHosting: (overrideCreds?: { apiUrl?: string; identifier?: string; secret?: string }) => Promise<{ success: boolean; count?: number; message?: string; detectedIp?: string }>;

  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  recordPayment: (invoiceId: string, amount: number, method: Payment['method'], reference?: string) => void;
  payments: Payment[];

  // Staff Payroll
  payrollRecords: PayrollRecord[];
  addPayrollRecord: (record: Omit<PayrollRecord, 'id' | 'createdAt'>) => void;
  updatePayrollRecord: (id: string, updates: Partial<PayrollRecord>) => void;
  deletePayrollRecord: (id: string) => void;
  processPayrollBatch: (period: string) => void;
  setStaffPayrollAccess: (userId: string, hasAccess: boolean) => void;

  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;

  // Office Expense
  requisitions: Requisition[];
  createRequisition: (data: { title: string; description: string; amount: number; category: string; urgency: Requisition['urgency']; currency?: Requisition['currency'] }) => void;
  updateRequisition: (id: string, updates: Partial<Requisition>) => void;
  deleteRequisition: (id: string) => void;
  updateRequisitionDecision: (id: string, status: 'Approved' | 'Rejected', decisionNotes: string) => void;
  disburseRequisition: (id: string, transactionId: string) => void;

  // One-Minute Manager
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'progress' | 'status' | 'strategy_status'>) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  updateGoal: (id: string, updates: Partial<Pick<Goal, 'objective' | 'expected_result' | 'deadline'>>) => void;
  deleteGoal: (id: string) => void;
  submitGoalStrategy: (id: string, strategyText: string) => void;
  approveGoalStrategy: (id: string, feedbackNote?: string) => void;
  requestGoalStrategyRevision: (id: string, feedbackNote: string) => void;

  feedbacks: Feedback[];
  addFeedback: (fb: Omit<Feedback, 'id' | 'created_at'>) => void;

  // Global Activity & Notifications
  activities: ActivityItem[];
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;

  // Internal Memos & Executive Announcements
  memos: StaffMemo[];
  sendMemo: (data: {
    title: string;
    content: string;
    priority?: StaffMemo['priority'];
    category?: StaffMemo['category'];
    targetAudience?: StaffMemo['targetAudience'];
    targetDepartment?: string;
    targetStaffIds?: string[];
    requiresAcknowledgment?: boolean;
  }) => { success: boolean; memoId: string; message: string };
  markMemoAsRead: (memoId: string, staffId?: string) => void;
  acknowledgeMemo: (memoId: string, staffId?: string) => void;
  deleteMemo: (memoId: string) => void;

  // Real-Time & Delta Sync Engine
  syncDeltaToServer: (entity: string, action: 'upsert' | 'delete', itemOrId: any) => Promise<void>;
  syncEntityToServer: (entity: string, data: any) => Promise<void>;

  // Mobile Navigation
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_users');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {}
      }
    }
    return initialProfiles;
  });

  // currentUser/isAuthenticated start empty/false and are only set once GET /api/auth/me
  // confirms a real server-verified session (see the bootstrap effect below) — they are
  // never trusted from localStorage alone, which previously let anyone impersonate any
  // account just by editing their own browser storage.
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialProfiles[0]);
  const [authLoading, setAuthLoading] = useState(true);

  const [viewAsUserId, setViewAsUserId] = useState<string | null>(null);
  const viewAsUser = viewAsUserId ? users.find(u => u.id === viewAsUserId) || null : null;
  const effectiveUser = viewAsUser || currentUser;

  const setViewAsUser = (userId: string | null): { success: boolean; message?: string } => {
    if (userId === null) {
      setViewAsUserId(null);
      return { success: true };
    }
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'Staff member not found.' };
    }
    if (target.id === currentUser.id) {
      return { success: false, message: "That's your own account." };
    }
    if (!canAssignTo(currentUser, target)) {
      return { success: false, message: 'You can only view the dashboards of your own direct reports.' };
    }
    setViewAsUserId(userId);
    return { success: true };
  };

  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_leads');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((l: any) => {
              let b = l.budget;
              let ev = l.estimatedValue;
              if (l.currency === 'GBP' && b <= 10000) b = b * 1250;
              if (l.currency === 'USD' && b <= 10000) b = b * 1250;
              if (l.currency === 'GBP' && ev <= 10000) ev = ev * 1250;
              if (l.currency === 'USD' && ev <= 10000) ev = ev * 1250;
              return { ...l, currency: 'NGN' as Currency, budget: b, estimatedValue: ev };
            });
          }
        } catch {}
      }
    }
    return initialLeads;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_contacts');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialContacts;
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_companies');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialCompanies;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_projects');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((p: any) => ({ ...p, currency: 'NGN' as Currency }));
          }
        } catch {}
      }
    }
    return initialProjects.map(p => ({ ...p, currency: 'NGN' as Currency }));
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_tasks');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialTasks;
  });

  const [services, setServices] = useState<Service[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_services');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((s: any) => ({ ...s, currency: 'NGN' as Currency }));
          }
        } catch {}
      }
    }
    return initialServices.map(s => ({ ...s, currency: 'NGN' as Currency }));
  });

  const [hostingAccounts, setHostingAccounts] = useState<HostingAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_hosting');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((h: any) => ({ ...h, currency: 'NGN' as Currency }));
          }
        } catch {}
      }
    }
    return initialHostingAccounts.map(h => ({ ...h, currency: 'NGN' as Currency }));
  });

  const [whmcsConfig, setWhmcsConfig] = useState<WhmcsConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_whmcs_config');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return {
      apiUrl: 'https://billing.modewebhost.com',
      identifier: 'MODE_WHMCS_API_ID',
      secret: '••••••••••••••••',
      autoSync: true,
      isConnected: true,
      lastSyncAt: new Date().toISOString(),
      totalLiveDomains: 6,
    };
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_invoices');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((inv: any) => {
              let total = inv.total;
              let subtotal = inv.subtotal;
              if ((inv.currency === 'GBP' || inv.currency === 'USD') && total <= 10000) {
                total = total * 1250;
                subtotal = (subtotal || total) * 1250;
              }
              return {
                ...inv,
                currency: 'NGN' as Currency,
                total,
                subtotal,
                items: (inv.items || []).map((it: any) => ({
                  ...it,
                  unitPrice: (inv.currency === 'GBP' || inv.currency === 'USD') && it.unitPrice <= 10000 ? it.unitPrice * 1250 : it.unitPrice,
                  total: (inv.currency === 'GBP' || inv.currency === 'USD') && it.total <= 10000 ? it.total * 1250 : it.total
                }))
              };
            });
          }
        } catch {}
      }
    }
    return initialInvoices.map(inv => ({ ...inv, currency: 'NGN' as Currency }));
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_payments');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialPayments;
  });

  const [requisitions, setRequisitions] = useState<Requisition[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_requisitions');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map((r: any) => ({ ...r, currency: 'NGN' as Currency }));
          }
        } catch {}
      }
    }
    return initialRequisitions.map(r => ({ ...r, currency: 'NGN' as Currency }));
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_goals');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialGoals;
  });

  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_feedbacks');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialFeedbacks;
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_tickets');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialTickets;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_activities');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialActivities;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_notifications');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialNotifications;
  });

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_payroll');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((p: any) => ({ ...p, currency: 'NGN' as Currency }));
          }
        } catch {}
      }
    }
    return initialPayrollRecords.map(p => ({ ...p, currency: 'NGN' as Currency }));
  });

  const [shifts, setShifts] = useState<StaffShift[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_shifts');
      if (saved) {
        try {
          const parsed: StaffShift[] = JSON.parse(saved);
          const today = new Date().toISOString().split('T')[0];
          const updated = parsed.map(s => {
            // Only auto-complete an unclosed active shift if it was started more than 24 hours ago
            const startMs = Date.parse(s.clockInTime);
            const isOlderThan24h = !isNaN(startMs) && (Date.now() - startMs > 24 * 3600 * 1000);
            if (s.status === 'active' && isOlderThan24h) {
              const mockEnd = startMs + 8 * 3600 * 1000;
              return {
                ...s,
                status: 'completed' as const,
                clockOutTime: new Date(mockEnd).toISOString(),
                durationHours: s.durationHours || 8.0,
                notes: `${s.notes || ''} (Auto-closed expired shift)`.trim()
              };
            }
            return s;
          });
          return updated;
        } catch {}
      }
    }
    return initialShifts;
  });

  const [memos, setMemos] = useState<StaffMemo[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_memos');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialMemos;
  });

  const [shiftTasks, setShiftTasks] = useState<ShiftTask[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_shift_tasks');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialShiftTasks;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const activeShift = shifts.find(s => (s.staffId === currentUser.id || (Boolean(s.staffEmail) && Boolean(currentUser.email) && s.staffEmail.toLowerCase() === currentUser.email.toLowerCase())) && s.status === 'active') || null;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setMobileSidebarOpen(prev => !prev);

  const [shiftReviewModalOpen, setShiftReviewModalOpen] = useState(false);
  const [resumeShiftModalOpen, setResumeShiftModalOpen] = useState(false);

  const usersRef = useRef<UserProfile[]>(users);
  useEffect(() => { usersRef.current = users; }, [users]);

  const servicesRef = useRef<Service[]>(services);
  useEffect(() => { servicesRef.current = services; }, [services]);

  const shiftsRef = useRef<StaffShift[]>(shifts);
  useEffect(() => { shiftsRef.current = shifts; }, [shifts]);

  const shiftTasksRef = useRef<ShiftTask[]>(shiftTasks);
  useEffect(() => { shiftTasksRef.current = shiftTasks; }, [shiftTasks]);

  const memosRef = useRef<StaffMemo[]>(memos);
  useEffect(() => { memosRef.current = memos; }, [memos]);

  const lastLocalEditRef = useRef<{ [key: string]: number }>({});

  const syncEntityToServer = async (entity: string, data: any) => {
    try {
      lastLocalEditRef.current[entity] = Date.now();
      if (typeof window !== 'undefined') {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity, data, timestamp: new Date().toISOString() })
        });
      }
    } catch {
      // background sync deferred
    }
  };

  const syncDeltaToServer = async (entity: string, action: 'upsert' | 'delete', itemOrId: any) => {
    try {
      lastLocalEditRef.current[entity] = Date.now();
      if (typeof window !== 'undefined') {
        const payload = {
          delta: {
            entity,
            action,
            item: typeof itemOrId === 'object' ? itemOrId : undefined,
            id: typeof itemOrId === 'string' ? itemOrId : itemOrId?.id
          },
          timestamp: new Date().toISOString()
        };
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch {
      // background sync deferred
    }
  };

  // Warm IndexedDB cache on boot
  useEffect(() => {
    initStorage();
  }, []);

  // Establish the real, server-verified session. The httpOnly cookie (if any) was already
  // set by a prior login — this just confirms it's still valid and fetches the current
  // profile fresh from the server, rather than ever trusting a cached client-side copy.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const result = await res.json();
          if (!cancelled && result?.success && result.user) {
            setCurrentUser(result.user);
            setIsAuthenticated(true);
          }
        }
      } catch {
        // treated as not authenticated
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Optimized asynchronous IndexedDB + localStorage persistence (non-blocking)
  useEffect(() => { setStorageItem('mode_ops_leads', leads); }, [leads]);
  useEffect(() => { setStorageItem('mode_ops_users', users); }, [users]);
  useEffect(() => { setStorageItem('mode_ops_companies', companies); }, [companies]);
  useEffect(() => { setStorageItem('mode_ops_contacts', contacts); }, [contacts]);
  useEffect(() => { setStorageItem('mode_ops_projects', projects); }, [projects]);
  useEffect(() => { setStorageItem('mode_ops_services', services); }, [services]);
  useEffect(() => { setStorageItem('mode_ops_requisitions', requisitions); }, [requisitions]);
  useEffect(() => { setStorageItem('mode_ops_goals', goals); }, [goals]);
  useEffect(() => { setStorageItem('mode_ops_invoices', invoices); }, [invoices]);
  useEffect(() => { setStorageItem('mode_ops_payments', payments); }, [payments]);
  useEffect(() => { setStorageItem('mode_ops_hosting', hostingAccounts); }, [hostingAccounts]);
  useEffect(() => { setStorageItem('mode_ops_whmcs_config', whmcsConfig); }, [whmcsConfig]);
  useEffect(() => { setStorageItem('mode_ops_tasks', tasks); }, [tasks]);
  useEffect(() => { setStorageItem('mode_ops_shift_tasks', shiftTasks); }, [shiftTasks]);
  useEffect(() => { setStorageItem('mode_ops_feedbacks', feedbacks); }, [feedbacks]);
  useEffect(() => { setStorageItem('mode_ops_tickets', tickets); }, [tickets]);
  useEffect(() => { setStorageItem('mode_ops_activities', activities); }, [activities]);
  useEffect(() => { setStorageItem('mode_ops_notifications', notifications); }, [notifications]);
  useEffect(() => { setStorageItem('mode_ops_payroll', payrollRecords); }, [payrollRecords]);
  useEffect(() => { setStorageItem('mode_ops_shifts', shifts); }, [shifts]);
  useEffect(() => { setStorageItem('mode_ops_memos', memos); }, [memos]);

  // Cross-device & Multi-tab Server Sync Hook
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isSubscribed = true;

    const pullServerState = async () => {
      try {
        const res = await fetch('/api/sync');
        if (!res.ok) return;
        const result = await res.json();
        if (result?.success && result.data && isSubscribed) {
          const serverDb = result.data;
          
          // Sync services catalog safely (never overwrite local customized services with older server data)
          if (Array.isArray(serverDb.services) && serverDb.services.length > 0) {
            setServices(prev => {
              const prevStr = JSON.stringify(prev);
              const serverStr = JSON.stringify(serverDb.services);
              if (prevStr === serverStr) return prev;

              const isCustomized = typeof window !== 'undefined' && localStorage.getItem('mode_ops_services_customized') === 'true';
              const localTs = Number(typeof window !== 'undefined' ? localStorage.getItem('mode_ops_services_timestamp') || '0' : '0');
              const serverTs = serverDb.servicesLastUpdated ? new Date(serverDb.servicesLastUpdated).getTime() : 0;

              // If local services were customized by user or local is newer than server, DO NOT OVERWRITE! Push local to server!
              if (isCustomized || localTs > serverTs) {
                syncEntityToServer('services', prev);
                return prev;
              }

              // Server genuinely has newer updates
              localStorage.setItem('mode_ops_services', serverStr);
              return serverDb.services.map((s: any) => ({ ...s, currency: 'NGN' }));
            });
          }

          // Sync staff shifts safely (protect active shifts from ever being overwritten or closed by server)
          if (Array.isArray(serverDb.shifts) && serverDb.shifts.length > 0) {
            setShifts(prev => {
              const prevStr = JSON.stringify(prev);
              const serverStr = JSON.stringify(serverDb.shifts);
              if (prevStr === serverStr) return prev;

              // CRITICAL: Check if local has an active shift
              const localActive = prev.find(s => s.status === 'active');
              const serverActive = serverDb.shifts.find((s: any) => s.status === 'active');

              // If local is currently clocked in (active), NEVER allow server's completed shifts to overwrite/clock out!
              if (localActive && (!serverActive || serverActive.id !== localActive.id)) {
                // Ensure the active shift is preserved and push to server
                const mergedShifts = [
                  localActive,
                  ...serverDb.shifts.filter((s: any) => s.id !== localActive.id)
                ];
                syncEntityToServer('shifts', mergedShifts);
                localStorage.setItem('mode_ops_shifts', JSON.stringify(mergedShifts));
                return mergedShifts;
              }

              const localTs = Number(typeof window !== 'undefined' ? localStorage.getItem('mode_ops_shifts_timestamp') || '0' : '0');
              const serverTs = serverDb.shiftsLastUpdated ? new Date(serverDb.shiftsLastUpdated).getTime() : 0;
              if (localTs > serverTs) {
                syncEntityToServer('shifts', prev);
                return prev;
              }

              localStorage.setItem('mode_ops_shifts', serverStr);
              return serverDb.shifts;
            });
          }

          // Sync shift tasks safely with timestamp protection
          if (Array.isArray(serverDb.shiftTasks) && serverDb.shiftTasks.length > 0) {
            setShiftTasks(prev => {
              const prevStr = JSON.stringify(prev);
              const serverStr = JSON.stringify(serverDb.shiftTasks);
              if (prevStr === serverStr) return prev;

              const localTs = Number(typeof window !== 'undefined' ? localStorage.getItem('mode_ops_shift_tasks_timestamp') || '0' : '0');
              const serverTs = serverDb.shiftTasksLastUpdated ? new Date(serverDb.shiftTasksLastUpdated).getTime() : 0;
              if (localTs > serverTs) {
                syncEntityToServer('shiftTasks', prev);
                return prev;
              }

              localStorage.setItem('mode_ops_shift_tasks', serverStr);
              return serverDb.shiftTasks;
            });
          }

          // Simple last-write-wins merge for entities with no bespoke conflict logic of
          // their own (contrast services/shifts above, which protect specific invariants
          // like "never overwrite a customized catalog" or "never clobber an active shift").
          // Guards against a concurrent local edit being clobbered by a slightly-stale
          // server read landing in between.
          function mergeSimple<T>(entity: string, serverArray: T[] | undefined, serverTsIso: string | undefined, setter: React.Dispatch<React.SetStateAction<T[]>>) {
            if (!Array.isArray(serverArray)) return;
            setter(prev => {
              if (JSON.stringify(prev) === JSON.stringify(serverArray)) return prev;
              const localTs = lastLocalEditRef.current[entity] || 0;
              const serverTs = serverTsIso ? new Date(serverTsIso).getTime() : 0;
              if (localTs > serverTs) return prev;
              return serverArray;
            });
          }

          mergeSimple('requisitions', serverDb.requisitions, serverDb.requisitionsLastUpdated, setRequisitions);
          mergeSimple('leads', serverDb.leads, serverDb.leadsLastUpdated, setLeads);
          mergeSimple('contacts', serverDb.contacts, undefined, setContacts);
          mergeSimple('companies', serverDb.companies, undefined, setCompanies);
          mergeSimple('projects', serverDb.projects, serverDb.projectsLastUpdated, setProjects);
          mergeSimple('tasks', serverDb.tasks, undefined, setTasks);
          mergeSimple('hostingAccounts', serverDb.hostingAccounts, undefined, setHostingAccounts);
          mergeSimple('invoices', serverDb.invoices, serverDb.invoicesLastUpdated, setInvoices);
          mergeSimple('payments', serverDb.payments, serverDb.paymentsLastUpdated, setPayments);
          mergeSimple('tickets', serverDb.tickets, serverDb.ticketsLastUpdated, setTickets);
          mergeSimple('goals', serverDb.goals, serverDb.goalsLastUpdated, setGoals);
          mergeSimple('feedbacks', serverDb.feedbacks, serverDb.feedbacksLastUpdated, setFeedbacks);
          mergeSimple('payrollRecords', serverDb.payrollRecords, serverDb.payrollRecordsLastUpdated, setPayrollRecords);

          // Sync staff memos safely with timestamp protection
          if (Array.isArray(serverDb.memos) && serverDb.memos.length > 0) {
            setMemos(prev => {
              const prevStr = JSON.stringify(prev);
              const serverStr = JSON.stringify(serverDb.memos);
              if (prevStr === serverStr) return prev;

              const localTs = Number(typeof window !== 'undefined' ? localStorage.getItem('mode_ops_memos_timestamp') || '0' : '0');
              const serverTs = serverDb.memosLastUpdated ? new Date(serverDb.memosLastUpdated).getTime() : 0;
              if (localTs > serverTs) {
                syncEntityToServer('memos', prev);
                return prev;
              }

              localStorage.setItem('mode_ops_memos', serverStr);
              return serverDb.memos;
            });
          }

          // Sync staff profiles / users safely (never revert customized real staff to dummy credentials)
          if (Array.isArray(serverDb.users) && serverDb.users.length > 0) {
            const isCustomized = typeof window !== 'undefined' && localStorage.getItem('mode_ops_users_customized') === 'true';
            setUsers(prev => {
              const prevStr = JSON.stringify(prev);
              const serverStr = JSON.stringify(serverDb.users);
              if (prevStr === serverStr) return prev;

              // Check if server is still holding default dummy seed data
              const dummyEmails = ['chioma@modedigitalcreations.ng', 'emeka@modedigitalcreations.ng', 'fatima@modedigitalcreations.ng', 'ibrahim@modedigitalcreations.ng'];
              const serverHasDummies = serverDb.users.some((su: any) => dummyEmails.includes(su.email?.toLowerCase()));
              const prevHasRealCustom = prev.some(pu => !dummyEmails.includes(pu.email?.toLowerCase()));

              // If local has real custom staff and server still has dummy data, ALWAYS protect local and push to server!
              if (isCustomized || (prevHasRealCustom && serverHasDummies)) {
                syncEntityToServer('users', prev);
                return prev;
              }

              // Check local edit timestamps vs server
              const localTs = Number(typeof window !== 'undefined' ? localStorage.getItem('mode_ops_users_timestamp') || '0' : '0');
              const serverTs = serverDb.usersLastUpdated ? new Date(serverDb.usersLastUpdated).getTime() : 0;
              if (localTs > serverTs) {
                syncEntityToServer('users', prev);
                return prev;
              }

              // Server genuinely has newer data from another tab/device
              localStorage.setItem('mode_ops_users', serverStr);
              return serverDb.users;
            });
          }
        }
      } catch {}
    };

    pullServerState();

    // Cross-tab storage change handler
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mode_ops_services' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setServices(parsed.map(s => ({ ...s, currency: 'NGN' })));
        } catch {}
      }
      if (e.key === 'mode_ops_shifts' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setShifts(parsed);
        } catch {}
      }
      if (e.key === 'mode_ops_shift_tasks' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setShiftTasks(parsed);
        } catch {}
      }
      if (e.key === 'mode_ops_memos' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setMemos(parsed);
        } catch {}
      }
      if (e.key === 'mode_ops_users' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setUsers(parsed);
        } catch {}
      }
      if (e.key === 'mode_ops_payments' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setPayments(parsed);
        } catch {}
      }
    };

    const handleCustomServicesChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setServices(e.detail.map((s: any) => ({ ...s, currency: 'NGN' })));
      }
    };

    const handleCustomUsersChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setUsers(e.detail);
      }
    };

    const handleCustomShiftsChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setShifts(e.detail);
      }
    };

    const handleCustomShiftTasksChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setShiftTasks(e.detail);
      }
    };

    const handleCustomMemosChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setMemos(e.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mode_ops_services_changed', handleCustomServicesChange);
    window.addEventListener('mode_ops_users_changed', handleCustomUsersChange);
    window.addEventListener('mode_ops_shifts_changed', handleCustomShiftsChange);
    window.addEventListener('mode_ops_shift_tasks_changed', handleCustomShiftTasksChange);
    window.addEventListener('mode_ops_memos_changed', handleCustomMemosChange);
    window.addEventListener('focus', pullServerState);

    // Real-Time Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    if (typeof EventSource !== 'undefined') {
      try {
        eventSource = new EventSource('/api/sync/events');

        eventSource.addEventListener('sync', (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            if (!isSubscribed) return;

            if (payload.type === 'delta') {
              const { entity, action, item, id } = payload;
              if (entity === 'shiftTasks') {
                setShiftTasks(prev => {
                  if (action === 'delete') {
                    return prev.filter(t => t.id !== (id || item?.id));
                  }
                  if (action === 'upsert' && item) {
                    const idx = prev.findIndex(t => t.id === item.id);
                    if (idx !== -1) {
                      const next = [...prev];
                      next[idx] = { ...next[idx], ...item };
                      return next;
                    }
                    return [item, ...prev];
                  }
                  return prev;
                });
              } else if (entity === 'memos') {
                setMemos(prev => {
                  if (action === 'delete') {
                    return prev.filter(m => m.id !== (id || item?.id));
                  }
                  if (action === 'upsert' && item) {
                    const idx = prev.findIndex(m => m.id === item.id);
                    if (idx !== -1) {
                      const next = [...prev];
                      next[idx] = { ...next[idx], ...item };
                      return next;
                    }
                    return [item, ...prev];
                  }
                  return prev;
                });
              } else {
                pullServerState();
              }
            } else if (payload.type === 'snapshot') {
              pullServerState();
            }
          } catch {}
        });
      } catch {}
    }

    // Polling fallback (relaxed from 5s to 15s since SSE delivers instantaneous live updates)
    const pollTimer = setInterval(pullServerState, 15000);

    return () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mode_ops_services_changed', handleCustomServicesChange);
      window.removeEventListener('mode_ops_users_changed', handleCustomUsersChange);
      window.removeEventListener('mode_ops_shifts_changed', handleCustomShiftsChange);
      window.removeEventListener('mode_ops_shift_tasks_changed', handleCustomShiftTasksChange);
      window.removeEventListener('mode_ops_memos_changed', handleCustomMemosChange);
      window.removeEventListener('focus', pullServerState);
      clearInterval(pollTimer);
    };
  }, []);

  // Switch Role
  const updateUserProfile = (id: string, updates: Partial<UserProfile>) => {
    let resolvedName = updates.full_name;
    const currentUsers = usersRef.current && usersRef.current.length > 0 ? usersRef.current : users;
    const updatedUsers = currentUsers.map(u => {
      if (u.id === id) {
        const next = { ...u, ...updates };
        resolvedName = next.full_name;
        return next;
      }
      return u;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_users', JSON.stringify(updatedUsers));
      localStorage.setItem('mode_ops_users_customized', 'true');
      localStorage.setItem('mode_ops_users_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_users_changed', { detail: updatedUsers }));
    }
    setUsers(updatedUsers);
    syncEntityToServer('users', updatedUsers);

    if (currentUser.id === id) {
      const nextCurrent = { ...currentUser, ...updates };
      setCurrentUser(nextCurrent);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_current_user', JSON.stringify(nextCurrent));
      }
    }

    // Cascade name, job title, department, hourly rate to all shift records
    const currentShifts = shiftsRef.current && shiftsRef.current.length > 0 ? shiftsRef.current : shifts;
    const updatedShifts = currentShifts.map(s => {
      if (s.staffId === id || (updates.email && s.staffEmail?.toLowerCase() === updates.email.toLowerCase())) {
        return {
          ...s,
          staffName: updates.full_name || s.staffName,
          staffEmail: updates.email || s.staffEmail,
          department: updates.department || s.department,
          jobTitle: updates.job_title || s.jobTitle,
          hourlyRate: updates.hourly_rate !== undefined ? updates.hourly_rate : s.hourlyRate
        };
      }
      return s;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shifts', JSON.stringify(updatedShifts));
      localStorage.setItem('mode_ops_shifts_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_shifts_changed', { detail: updatedShifts }));
    }
    setShifts(updatedShifts);
    syncEntityToServer('shifts', updatedShifts);

    // Cascade name to shift checklist tasks
    const currentTasks = shiftTasksRef.current && shiftTasksRef.current.length > 0 ? shiftTasksRef.current : shiftTasks;
    const updatedTasks = currentTasks.map(st => {
      if (st.staffId === id) {
        return {
          ...st,
          staffName: updates.full_name || st.staffName
        };
      }
      return st;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shift_tasks', JSON.stringify(updatedTasks));
    }
    setShiftTasks(updatedTasks);
    syncEntityToServer('shiftTasks', updatedTasks);

    logActivity('user_profile_update', `Executive updated profile for ${resolvedName || id}`, 'User', id);
  };

  const addUserProfile = (profileData: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...profileData,
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      is_active: profileData.is_active ?? true,
    };
    const currentUsers = usersRef.current && usersRef.current.length > 0 ? usersRef.current : users;
    const updatedUsers = [...currentUsers, newUser];
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_users', JSON.stringify(updatedUsers));
      localStorage.setItem('mode_ops_users_customized', 'true');
      localStorage.setItem('mode_ops_users_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_users_changed', { detail: updatedUsers }));
    }
    setUsers(updatedUsers);
    syncEntityToServer('users', updatedUsers);
    logActivity('user_create', `Added staff member: ${newUser.full_name} (${newUser.job_title || newUser.role})`, 'User', newUser.id);
  };

  const deleteUserProfile = (id: string) => {
    const currentUsers = usersRef.current && usersRef.current.length > 0 ? usersRef.current : users;
    const updatedUsers = currentUsers.filter(u => u.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_users', JSON.stringify(updatedUsers));
      localStorage.setItem('mode_ops_users_customized', 'true');
      localStorage.setItem('mode_ops_users_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_users_changed', { detail: updatedUsers }));
    }
    setUsers(updatedUsers);
    syncEntityToServer('users', updatedUsers);

    if (currentUser.id === id && updatedUsers.length > 0) {
      setCurrentUser(updatedUsers[0]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_current_user', JSON.stringify(updatedUsers[0]));
      }
    }

    // Remove active shifts for deleted profile
    const currentShifts = shiftsRef.current && shiftsRef.current.length > 0 ? shiftsRef.current : shifts;
    const updatedShifts = currentShifts.filter(s => s.staffId !== id || s.status === 'completed');
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shifts', JSON.stringify(updatedShifts));
      window.dispatchEvent(new CustomEvent('mode_ops_shifts_changed', { detail: updatedShifts }));
    }
    setShifts(updatedShifts);
    syncEntityToServer('shifts', updatedShifts);
    logActivity('user_delete', `Removed staff member profile (${id})`, 'User', id);
  };

  // Activity logger helper
  const logActivity = (type: string, description: string, entityType: string, entityId: string) => {
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      activity_type: type,
      description,
      entity_type: entityType,
      entity_id: entityId,
      user_name: currentUser.full_name,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // CRM Actions
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      currency: 'NGN',
      id: `l-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads(prev => {
      const updated = [newLead, ...prev];
      syncEntityToServer('leads', updated);
      return updated;
    });
    logActivity('crm_lead', `Added lead: ${newLead.name} (${newLead.company})`, 'Lead', newLead.id);
  };

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, status, updatedAt: new Date().toISOString().split('T')[0] } : l);
      syncEntityToServer('leads', updated);
      return updated;
    });
    const target = leads.find(l => l.id === id);
    if (target) {
      logActivity('crm_pipeline', `Moved ${target.company} to ${status.replace('-', ' ')}`, 'Lead', id);
    }
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : l);
      syncEntityToServer('leads', updated);
      return updated;
    });
    logActivity('crm_lead', `Updated lead details for ${updates.name || id}`, 'Lead', id);
  };

  const deleteLead = (id: string) => {
    setLeads(prev => {
      const updated = prev.filter(l => l.id !== id);
      syncEntityToServer('leads', updated);
      return updated;
    });
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContacts(prev => {
      const updated = [newContact, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_contacts', JSON.stringify(updated));
      }
      syncEntityToServer('contacts', updated);
      return updated;
    });
    logActivity('crm_contact', `Added client contact: ${newContact.name}`, 'Contact', newContact.id);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_contacts', JSON.stringify(updated));
      }
      syncEntityToServer('contacts', updated);
      return updated;
    });
    logActivity('crm_contact', `Updated client contact: ${updates.name || id}`, 'Contact', id);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_contacts', JSON.stringify(updated));
      }
      syncEntityToServer('contacts', updated);
      return updated;
    });
    logActivity('crm_contact', `Removed contact from client directory`, 'Contact', id);
  };

  const addCompany = (companyData: Omit<Company, 'id' | 'createdAt'>) => {
    const newCompany: Company = {
      ...companyData,
      id: `co-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCompanies(prev => {
      const updated = [newCompany, ...prev];
      syncEntityToServer('companies', updated);
      return updated;
    });
    logActivity('crm_company', `Added corporate client org: ${newCompany.name}`, 'Company', newCompany.id);
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      syncEntityToServer('companies', updated);
      return updated;
    });
    logActivity('crm_company', `Updated corporate client org: ${updates.name || id}`, 'Company', id);
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => {
      const updated = prev.filter(c => c.id !== id);
      syncEntityToServer('companies', updated);
      return updated;
    });
    logActivity('crm_company', `Deleted corporate client org (${id})`, 'Company', id);
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      currency: 'NGN',
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects(prev => {
      const updated = [newProject, ...prev];
      syncEntityToServer('projects', updated);
      return updated;
    });
    logActivity('crm_project', `Created client project: ${newProject.name}`, 'Project', newProject.id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      syncEntityToServer('projects', updated);
      return updated;
    });
    logActivity('crm_project', `Updated client project: ${updates.name || id}`, 'Project', id);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      syncEntityToServer('projects', updated);
      return updated;
    });
    setTasks(prev => {
      const updated = prev.filter(t => t.projectId !== id);
      syncEntityToServer('tasks', updated);
      return updated;
    });
    logActivity('crm_project', `Deleted client project (${id})`, 'Project', id);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status: (t.status === 'completed' ? 'pending' : 'completed') as Task['status'] } : t);
      syncEntityToServer('tasks', updated);
      return updated;
    });
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => {
      const updated = [newTask, ...prev];
      syncEntityToServer('tasks', updated);
      return updated;
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      syncEntityToServer('tasks', updated);
      return updated;
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id);
      syncEntityToServer('tasks', updated);
      return updated;
    });
  };

  // Daily Shift Task Checklist
  const addShiftTask = (taskData: Omit<ShiftTask, 'id' | 'createdAt'>): ShiftTask => {
    const newTask: ShiftTask = {
      ...taskData,
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: taskData.status || 'pending',
      createdAt: new Date().toISOString(),
    };
    const currentTasks = shiftTasksRef.current && shiftTasksRef.current.length > 0 ? shiftTasksRef.current : shiftTasks;
    const updated = [newTask, ...currentTasks];
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shift_tasks', JSON.stringify(updated));
      localStorage.setItem('mode_ops_shift_tasks_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_shift_tasks_changed', { detail: updated }));
    }
    setShiftTasks(updated);
    syncEntityToServer('shiftTasks', updated);
    syncDeltaToServer('shiftTasks', 'upsert', newTask);
    logActivity('shift_task_created', `Added shift task: ${newTask.title}`, 'ShiftTask', newTask.id);
    return newTask;
  };

  const toggleShiftTask = (id: string) => {
    const now = new Date().toISOString();
    const currentTasks = shiftTasksRef.current && shiftTasksRef.current.length > 0 ? shiftTasksRef.current : shiftTasks;
    const updated = currentTasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
        return {
          ...t,
          status: nextStatus as 'pending' | 'completed',
          completedAt: nextStatus === 'completed' ? now : undefined,
        };
      }
      return t;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shift_tasks', JSON.stringify(updated));
      localStorage.setItem('mode_ops_shift_tasks_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_shift_tasks_changed', { detail: updated }));
    }
    setShiftTasks(updated);
    syncEntityToServer('shiftTasks', updated);
    const target = updated.find(t => t.id === id);
    if (target) syncDeltaToServer('shiftTasks', 'upsert', target);
  };

  const updateShiftTask = (id: string, updates: Partial<ShiftTask>) => {
    const currentTasks = shiftTasksRef.current && shiftTasksRef.current.length > 0 ? shiftTasksRef.current : shiftTasks;
    const updated = currentTasks.map(t => t.id === id ? { ...t, ...updates } : t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shift_tasks', JSON.stringify(updated));
      localStorage.setItem('mode_ops_shift_tasks_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_shift_tasks_changed', { detail: updated }));
    }
    setShiftTasks(updated);
    syncEntityToServer('shiftTasks', updated);
    const target = updated.find(t => t.id === id);
    if (target) syncDeltaToServer('shiftTasks', 'upsert', target);
  };

  const deleteShiftTask = (id: string) => {
    const currentTasks = shiftTasksRef.current && shiftTasksRef.current.length > 0 ? shiftTasksRef.current : shiftTasks;
    const updated = currentTasks.filter(t => t.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shift_tasks', JSON.stringify(updated));
      localStorage.setItem('mode_ops_shift_tasks_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_shift_tasks_changed', { detail: updated }));
    }
    setShiftTasks(updated);
    syncEntityToServer('shiftTasks', updated);
    syncDeltaToServer('shiftTasks', 'delete', id);
  };

  const moveShiftTaskToNextDay = (id: string, nextDate?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = nextDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const currentTasks = shiftTasksRef.current && shiftTasksRef.current.length > 0 ? shiftTasksRef.current : shiftTasks;
    const updated = currentTasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          date: targetDate,
          carriedForwardFrom: t.date || today,
          status: 'pending' as const,
        };
      }
      return t;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shift_tasks', JSON.stringify(updated));
      localStorage.setItem('mode_ops_shift_tasks_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_shift_tasks_changed', { detail: updated }));
    }
    setShiftTasks(updated);
    syncEntityToServer('shiftTasks', updated);
    logActivity('shift_task_carried_forward', `Shift task moved forward to ${targetDate}`, 'ShiftTask', id);
  };

  const completeShiftReview = ({
    staffId,
    shiftId,
    completedTaskIds,
    reviewNotes
  }: {
    staffId: string;
    shiftId?: string;
    completedTaskIds: string[];
    reviewNotes?: string;
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const now = new Date().toISOString();

    let accomplishedCount = 0;
    let carriedForwardCount = 0;

    const currentTasks = shiftTasksRef.current && shiftTasksRef.current.length > 0 ? shiftTasksRef.current : shiftTasks;
    const updated = currentTasks.map(t => {
      if (t.staffId === staffId && (t.date === today || t.status === 'pending')) {
        if (completedTaskIds.includes(t.id)) {
          accomplishedCount++;
          return {
            ...t,
            status: 'completed' as const,
            completedAt: now,
          };
        } else {
          // Task is pending, move forward to the next day!
          carriedForwardCount++;
          return {
            ...t,
            date: tomorrow,
            carriedForwardFrom: t.date || today,
            status: 'pending' as const,
          };
        }
      }
      return t;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shift_tasks', JSON.stringify(updated));
      localStorage.setItem('mode_ops_shift_tasks_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_shift_tasks_changed', { detail: updated }));
    }
    setShiftTasks(updated);
    syncEntityToServer('shiftTasks', updated);

    // Close the staff shift
    const currentShifts = shiftsRef.current && shiftsRef.current.length > 0 ? shiftsRef.current : shifts;
    const targetShiftId = shiftId || currentShifts.find(s => (s.staffId === staffId || s.staffEmail === currentUser.email) && s.status === 'active')?.id;
    if (targetShiftId) {
      const shiftNotes = `${reviewNotes ? reviewNotes + ' • ' : ''}${completedTaskIds.length} tasks accomplished, ${carriedForwardCount} pending moved to next day.`;
      clockOutStaff(targetShiftId, undefined, shiftNotes);
    } else {
      logout();
    }

    logActivity('shift_review_completed', `Completed shift work plan review: ${completedTaskIds.length} accomplished, ${carriedForwardCount} carried forward`, 'StaffShift', staffId);

    return { accomplishedCount, carriedForwardCount };
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      currency: 'NGN',
    };
    const currentList = servicesRef.current && servicesRef.current.length > 0 ? servicesRef.current : services;
    const updated = [newService, ...currentList];
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_services', JSON.stringify(updated));
      localStorage.setItem('mode_ops_services_customized', 'true');
      localStorage.setItem('mode_ops_services_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_services_changed', { detail: updated }));
    }
    setServices(updated);
    syncEntityToServer('services', updated);
    logActivity('crm_service', `Added service catalog solution: ${newService.name}`, 'Service', newService.id);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    const currentList = servicesRef.current && servicesRef.current.length > 0 ? servicesRef.current : services;
    const updated = currentList.map(s => s.id === id ? { ...s, ...updates, currency: 'NGN' as Currency } : s);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_services', JSON.stringify(updated));
      localStorage.setItem('mode_ops_services_customized', 'true');
      localStorage.setItem('mode_ops_services_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_services_changed', { detail: updated }));
    }
    setServices(updated);
    syncEntityToServer('services', updated);
    logActivity('crm_service', `Updated service solution: ${updates.name || id}`, 'Service', id);
  };

  const deleteService = (id: string) => {
    const currentList = servicesRef.current && servicesRef.current.length > 0 ? servicesRef.current : services;
    const updated = currentList.filter(s => s.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_services', JSON.stringify(updated));
      localStorage.setItem('mode_ops_services_customized', 'true');
      localStorage.setItem('mode_ops_services_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_services_changed', { detail: updated }));
    }
    setServices(updated);
    syncEntityToServer('services', updated);
    logActivity('crm_service', `Deleted service solution (${id})`, 'Service', id);
  };

  const renewHosting = (id: string, additionalMonths = 12) => {
    setHostingAccounts(prev => {
      const updated = prev.map(h => {
        if (h.id === id) {
          const curr = new Date(h.expiryDate);
          curr.setMonth(curr.getMonth() + additionalMonths);
          return {
            ...h,
            expiryDate: curr.toISOString().split('T')[0],
            status: 'active' as const,
            sslStatus: 'active' as const,
          };
        }
        return h;
      });
      syncEntityToServer('hostingAccounts', updated);
      return updated;
    });
    const target = hostingAccounts.find(h => h.id === id);
    if (target) {
      logActivity('hosting_renew', `Extended domain & hosting renewal for ${target.domainName} by ${additionalMonths} months`, 'Hosting', id);
    }
  };

  const updateWhmcsConfig = (updates: Partial<WhmcsConfig>) => {
    setWhmcsConfig(prev => {
      const next = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_whmcs_config', JSON.stringify(next));
      }
      return next;
    });
  };

  // Accepts an optional credential override so a caller that just updated whmcsConfig via
  // updateWhmcsConfig() (a state setter — not applied until next render) can sync with the
  // values it actually just typed/tested, instead of this closure's stale whmcsConfig.
  const syncWhmcsHosting = async (overrideCreds?: { apiUrl?: string; identifier?: string; secret?: string }): Promise<{ success: boolean; count?: number; message?: string; detectedIp?: string }> => {
    try {
      const res = await fetch('/api/whmcs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: overrideCreds?.apiUrl ?? whmcsConfig.apiUrl,
          identifier: overrideCreds?.identifier ?? whmcsConfig.identifier,
          secret: overrideCreds?.secret ?? whmcsConfig.secret
        })
      });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.accounts)) {
        setHostingAccounts(data.accounts);
        syncEntityToServer('hostingAccounts', data.accounts);
        const now = new Date().toISOString();
        updateWhmcsConfig({
          isConnected: true,
          lastSyncAt: now,
          totalLiveDomains: data.accounts.length
        });
        logActivity('whmcs_sync', `Synchronized ${data.accounts.length} live domain & hosting renewals from WHMCS`, 'Hosting', 'whmcs');
        return { success: true, count: data.accounts.length, message: data.message };
      }
      return { success: false, message: data?.message || data?.error || 'Failed to sync', detectedIp: data?.detectedIp };
    } catch (err: any) {
      return { success: false, message: err?.message || 'WHMCS sync error' };
    }
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      currency: 'NGN',
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setInvoices(prev => {
      const updated = [newInvoice, ...prev];
      syncEntityToServer('invoices', updated);
      return updated;
    });
    logActivity('crm_invoice', `Created invoice #${newInvoice.invoiceNumber} for ${newInvoice.clientName}`, 'Invoice', newInvoice.id);
  };

  const recordPayment = (invoiceId: string, amount: number, method: Payment['method'], reference?: string) => {
    const newPayment: Payment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      invoiceId,
      amount,
      currency: 'NGN',
      method,
      reference: reference || `REF-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setPayments(prev => {
      const nextPayments = [newPayment, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_payments', JSON.stringify(nextPayments));
      }
      syncEntityToServer('payments', nextPayments);
      return nextPayments;
    });

    setInvoices(prev => {
      const updated = prev.map(inv => {
        if (inv.id === invoiceId) {
          const updatedPaid = inv.amountPaid + amount;
          const newStatus = updatedPaid >= inv.total ? 'paid' : 'partially-paid';
          return { ...inv, amountPaid: updatedPaid, status: newStatus as Invoice['status'] };
        }
        return inv;
      });
      syncEntityToServer('invoices', updated);
      return updated;
    });

    logActivity('crm_payment', `Recorded payment of ₦${amount.toLocaleString()} for Invoice`, 'Payment', newPayment.id);
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => {
      const updated = prev.map(inv => {
        if (inv.id === id) {
          const next = { ...inv, ...updates };
          if (updates.amountPaid !== undefined || updates.total !== undefined) {
            const paid = next.amountPaid ?? 0;
            const tot = next.total ?? 0;
            if (paid >= tot && tot > 0) next.status = 'paid';
            else if (paid > 0) next.status = 'partially-paid';
          }
          return next;
        }
        return inv;
      });
      syncEntityToServer('invoices', updated);
      return updated;
    });
    logActivity('crm_invoice', `Updated invoice details for #${updates.invoiceNumber || id}`, 'Invoice', id);
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => {
      const updated = prev.filter(inv => inv.id !== id);
      syncEntityToServer('invoices', updated);
      return updated;
    });
    setPayments(prev => {
      const next = prev.filter(p => p.invoiceId !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_payments', JSON.stringify(next));
      }
      syncEntityToServer('payments', next);
      return next;
    });
    logActivity('crm_invoice', `Deleted invoice #${id}`, 'Invoice', id);
  };

  const addPayrollRecord = (recordData: Omit<PayrollRecord, 'id' | 'createdAt'>) => {
    const newRecord: PayrollRecord = {
      ...recordData,
      currency: 'NGN',
      id: `payr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPayrollRecords(prev => {
      const updated = [newRecord, ...prev];
      syncEntityToServer('payrollRecords', updated);
      return updated;
    });
    logActivity('payroll', `Generated payroll record for ${newRecord.staffName} (${newRecord.period})`, 'Payroll', newRecord.id);
  };

  const updatePayrollRecord = (id: string, updates: Partial<PayrollRecord>) => {
    setPayrollRecords(prev => {
      const updated = prev.map(rec => rec.id === id ? { ...rec, ...updates } : rec);
      syncEntityToServer('payrollRecords', updated);
      return updated;
    });
    logActivity('payroll', `Updated payroll record for #${id}`, 'Payroll', id);
  };

  const deletePayrollRecord = (id: string) => {
    setPayrollRecords(prev => {
      const updated = prev.filter(rec => rec.id !== id);
      syncEntityToServer('payrollRecords', updated);
      return updated;
    });
    logActivity('payroll', `Removed payroll record #${id}`, 'Payroll', id);
  };

  const processPayrollBatch = (period: string) => {
    const now = new Date().toISOString();
    setPayrollRecords(prev => {
      const updated = prev.map(rec => {
        if (rec.period === period && rec.status !== 'paid') {
          return {
            ...rec,
            status: 'paid' as const,
            approvedBy: currentUser.full_name,
            approvedAt: now,
            paidAt: now
          };
        }
        return rec;
      });
      syncEntityToServer('payrollRecords', updated);
      return updated;
    });
    logActivity('payroll_batch', `Batch disbursed payroll for period: ${period}`, 'Payroll', period);
  };

  const setStaffPayrollAccess = (userId: string, hasAccess: boolean) => {
    updateUserProfile(userId, { hasPayrollAccess: hasAccess });
    logActivity('security', `${hasAccess ? 'Granted' : 'Revoked'} staff payroll permission for user #${userId}`, 'Security', userId);
  };

  const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `tk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTickets(prev => {
      const updated = [newTicket, ...prev];
      syncEntityToServer('tickets', updated);
      return updated;
    });
  };

  const updateTicketStatus = (id: string, status: Ticket['status']) => {
    setTickets(prev => {
      const updated = prev.map(tk => tk.id === id ? { ...tk, status } : tk);
      syncEntityToServer('tickets', updated);
      return updated;
    });
  };

  // Office Expense Actions
  const createRequisition = ({
    title, description, amount, category, urgency, currency = 'NGN'
  }: {
    title: string; description: string; amount: number; category: string; urgency: Requisition['urgency']; currency?: Requisition['currency']
  }) => {
    const newReq: Requisition = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      receiptNumber: generateReceiptNumber(),
      title,
      description,
      amount,
      currency: 'NGN',
      category,
      urgency,
      status: 'Pending',
      staffName: currentUser.full_name,
      staffId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setRequisitions(prev => [newReq, ...prev]);
    // Delta upsert (merges this one requisition into whatever's actually on the server right
    // now) rather than pushing this browser's whole local array — a full-array push here would
    // silently erase any OTHER staff member's requisition that this browser hadn't pulled yet.
    syncDeltaToServer('requisitions', 'upsert', newReq);
    logActivity('expense_create', `Staff ${currentUser.full_name} submitted requisition: ${title} (${currency} ${amount.toLocaleString()})`, 'Requisition', newReq.id);

    // Notify Manager/MD
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: 'u1',
      type: 'expense',
      title: 'New Requisition Pending Approval',
      message: `${currentUser.full_name} requested ${currency} ${amount.toLocaleString()} for ${title}`,
      link_url: '/dashboard/expenses',
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updateRequisitionDecision = (id: string, status: 'Approved' | 'Rejected', decisionNotes: string) => {
    let changedItem: Requisition | undefined;
    setRequisitions(prev => prev.map(r => {
      if (r.id !== id) return r;
      changedItem = { ...r, status, decisionNotes, decidedAt: new Date().toISOString(), decidedBy: currentUser.full_name };
      return changedItem;
    }));
    if (changedItem) syncDeltaToServer('requisitions', 'upsert', changedItem);
    logActivity('expense_decision', `${currentUser.full_name} marked requisition as ${status}`, 'Requisition', id);
  };

  const updateRequisition = (id: string, updates: Partial<Requisition>) => {
    let changedItem: Requisition | undefined;
    setRequisitions(prev => prev.map(r => {
      if (r.id !== id) return r;
      changedItem = { ...r, ...updates, currency: 'NGN' as Currency };
      return changedItem;
    }));
    if (changedItem) syncDeltaToServer('requisitions', 'upsert', changedItem);
    logActivity('expense_update', `Updated requisition #${id}`, 'Requisition', id);
  };

  const deleteRequisition = (id: string) => {
    const existing = requisitions.find(r => r.id === id);
    setRequisitions(prev => prev.filter(r => r.id !== id));
    syncDeltaToServer('requisitions', 'delete', id);
    logActivity('expense_delete', `Deleted requisition ${existing?.receiptNumber || id} (${existing?.title || ''})`, 'Requisition', id);
  };

  const disburseRequisition = (id: string, transactionId: string) => {
    let changedItem: Requisition | undefined;
    setRequisitions(prev => prev.map(r => {
      if (r.id !== id) return r;
      changedItem = { ...r, status: 'Completed' as const, completedAt: new Date().toISOString(), disbursedBy: currentUser.full_name, transactionId };
      return changedItem;
    }));
    if (changedItem) syncDeltaToServer('requisitions', 'upsert', changedItem);
    logActivity('expense_disburse', `Accounts disbursed requisition funds (${transactionId})`, 'Requisition', id);
  };

  // One-Minute Manager Actions
  const addGoal = (goalData: Omit<Goal, 'id' | 'created_at' | 'progress' | 'status' | 'strategy_status'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      progress: 0,
      status: 'not_started',
      strategy_status: 'pending_submission',
      created_at: new Date().toISOString(),
    };
    setGoals(prev => {
      const updated = [newGoal, ...prev];
      syncEntityToServer('goals', updated);
      return updated;
    });
    logActivity('omm_goal', `Assigned One-Minute Goal: ${goalData.objective}`, 'Goal', newGoal.id);
  };

  const updateGoalProgress = (id: string, progress: number) => {
    const bounded = Math.max(0, Math.min(100, progress));
    const status: GoalStatus = bounded === 100 ? 'completed' : bounded > 0 ? 'in_progress' : 'not_started';
    setGoals(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, progress: bounded, status } : g);
      syncEntityToServer('goals', updated);
      return updated;
    });
  };

  const updateGoal = (id: string, updates: Partial<Pick<Goal, 'objective' | 'expected_result' | 'deadline'>>) => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      syncEntityToServer('goals', updated);
      return updated;
    });
    logActivity('omm_goal', `Updated 1-Minute Goal details`, 'Goal', id);
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      syncEntityToServer('goals', updated);
      return updated;
    });
    logActivity('omm_goal', `Deleted 1-Minute Goal`, 'Goal', id);
  };

  const submitGoalStrategy = (id: string, strategyText: string) => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === id
        ? { ...g, strategy_text: strategyText, strategy_status: 'submitted' as const, strategy_submitted_at: new Date().toISOString() }
        : g);
      syncEntityToServer('goals', updated);
      return updated;
    });
    logActivity('omm_strategy', `Submitted 1-Minute Strategy Plan`, 'Goal', id);
  };

  const approveGoalStrategy = (id: string, feedbackNote?: string) => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === id
        ? { ...g, strategy_status: 'approved' as const, strategy_feedback: feedbackNote, strategy_approved_at: new Date().toISOString() }
        : g);
      syncEntityToServer('goals', updated);
      return updated;
    });
    logActivity('omm_strategy', `Approved 1-Minute Strategy Plan`, 'Goal', id);
  };

  const requestGoalStrategyRevision = (id: string, feedbackNote: string) => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === id
        ? { ...g, strategy_status: 'revision_requested' as const, strategy_feedback: feedbackNote }
        : g);
      syncEntityToServer('goals', updated);
      return updated;
    });
  };

  const addFeedback = (fbData: Omit<Feedback, 'id' | 'created_at'>) => {
    const newFb: Feedback = {
      ...fbData,
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    setFeedbacks(prev => {
      const updated = [newFb, ...prev];
      syncEntityToServer('feedbacks', updated);
      return updated;
    });
    logActivity('omm_feedback', `Sent One-Minute ${fbData.type === 'praise' ? 'Praise 🎉' : 'Redirect 🎯'} to ${fbData.employee_name}`, 'Feedback', newFb.id);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Staff Memos Actions
  const sendMemo = (data: {
    title: string;
    content: string;
    priority?: StaffMemo['priority'];
    category?: StaffMemo['category'];
    targetAudience?: StaffMemo['targetAudience'];
    targetDepartment?: string;
    targetStaffIds?: string[];
    requiresAcknowledgment?: boolean;
  }): { success: boolean; memoId: string; message: string } => {
    const priority = data.priority || 'normal';
    const category = data.category || 'general';
    const targetAudience = data.targetAudience || 'all';
    const nowIso = new Date().toISOString();
    const memoNumber = `MEMO-2026-${String(memos.length + 1).padStart(3, '0')}`;
    const newMemoId = `memo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newMemo: StaffMemo = {
      id: newMemoId,
      memoNumber,
      title: data.title.trim(),
      content: data.content.trim(),
      senderId: currentUser.id,
      senderName: currentUser.full_name,
      senderRole: currentUser.role,
      senderDepartment: currentUser.department || 'Management',
      targetAudience,
      targetDepartment: data.targetDepartment,
      targetStaffIds: data.targetStaffIds,
      priority,
      category,
      requiresAcknowledgment: data.requiresAcknowledgment ?? (priority === 'urgent' || priority === 'policy'),
      readBy: { [currentUser.id]: nowIso },
      acknowledgedBy: { [currentUser.id]: nowIso },
      createdAt: nowIso,
    };

    const currentMemos = memosRef.current && memosRef.current.length > 0 ? memosRef.current : memos;
    const updatedMemos = [newMemo, ...currentMemos];
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_memos', JSON.stringify(updatedMemos));
      localStorage.setItem('mode_ops_memos_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_memos_changed', { detail: updatedMemos }));
    }
    setMemos(updatedMemos);
    syncEntityToServer('memos', updatedMemos);
    syncDeltaToServer('memos', 'upsert', newMemo);

    // Send notifications to all recipients
    const targetStaff = users.filter(u => {
      if (u.id === currentUser.id) return false;
      if (targetAudience === 'all') return true;
      if (targetAudience === 'department' && data.targetDepartment) {
        return u.department?.toLowerCase() === data.targetDepartment.toLowerCase();
      }
      if (targetAudience === 'specific_staff' && data.targetStaffIds) {
        return data.targetStaffIds.includes(u.id);
      }
      return true;
    });

    const newNotifications: AppNotification[] = targetStaff.map(u => ({
      id: `notif-memo-${Date.now()}-${u.id}-${Math.random().toString(36).substring(2, 5)}`,
      user_id: u.id,
      type: 'memo',
      title: `${priority === 'urgent' ? '🚨 URGENT MEMO' : '📄 Management Memo'}: ${data.title}`,
      message: `${currentUser.full_name} (${currentUser.job_title || currentUser.role}) issued an official memo to ${targetAudience === 'all' ? 'all staff' : (data.targetDepartment || 'you')}.`,
      link_url: '/dashboard/memos',
      read: false,
      created_at: nowIso,
    }));

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
    }

    logActivity('memo_broadcast', `Management memo issued: "${newMemo.title}" (${memoNumber}) by ${currentUser.full_name}`, 'StaffMemo', newMemo.id);

    return {
      success: true,
      memoId: newMemo.id,
      message: `Memo ${memoNumber} broadcasted successfully to ${targetStaff.length} staff member${targetStaff.length === 1 ? '' : 's'}.`
    };
  };

  const markMemoAsRead = (memoId: string, staffId: string = currentUser.id) => {
    const nowIso = new Date().toISOString();
    const currentMemos = memosRef.current && memosRef.current.length > 0 ? memosRef.current : memos;
    const updatedMemos = currentMemos.map(m => {
      if (m.id === memoId && !m.readBy[staffId]) {
        return {
          ...m,
          readBy: { ...m.readBy, [staffId]: nowIso }
        };
      }
      return m;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_memos', JSON.stringify(updatedMemos));
      localStorage.setItem('mode_ops_memos_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_memos_changed', { detail: updatedMemos }));
    }
    setMemos(updatedMemos);
    syncEntityToServer('memos', updatedMemos);
    const target = updatedMemos.find(m => m.id === memoId);
    if (target) syncDeltaToServer('memos', 'upsert', target);
  };

  const acknowledgeMemo = (memoId: string, staffId: string = currentUser.id) => {
    const nowIso = new Date().toISOString();
    const currentMemos = memosRef.current && memosRef.current.length > 0 ? memosRef.current : memos;
    const targetMemo = currentMemos.find(m => m.id === memoId);
    const updatedMemos = currentMemos.map(m => {
      if (m.id === memoId) {
        return {
          ...m,
          readBy: { ...m.readBy, [staffId]: m.readBy[staffId] || nowIso },
          acknowledgedBy: { ...m.acknowledgedBy, [staffId]: nowIso }
        };
      }
      return m;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_memos', JSON.stringify(updatedMemos));
      localStorage.setItem('mode_ops_memos_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_memos_changed', { detail: updatedMemos }));
    }
    setMemos(updatedMemos);
    syncEntityToServer('memos', updatedMemos);
    if (targetMemo) {
      const updatedTarget = updatedMemos.find(m => m.id === memoId);
      if (updatedTarget) syncDeltaToServer('memos', 'upsert', updatedTarget);
      logActivity('memo_acknowledged', `${currentUser.full_name} acknowledged receipt of memo "${targetMemo.title}" (${targetMemo.memoNumber})`, 'StaffMemo', memoId);
    }
  };

  const deleteMemo = (memoId: string) => {
    const currentMemos = memosRef.current && memosRef.current.length > 0 ? memosRef.current : memos;
    const target = currentMemos.find(m => m.id === memoId);
    const updatedMemos = currentMemos.filter(m => m.id !== memoId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_memos', JSON.stringify(updatedMemos));
      localStorage.setItem('mode_ops_memos_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_memos_changed', { detail: updatedMemos }));
    }
    setMemos(updatedMemos);
    syncEntityToServer('memos', updatedMemos);
    syncDeltaToServer('memos', 'delete', memoId);

    if (target) {
      logActivity('memo_deleted', `Management memo retracted: "${target.title}" (${target.memoNumber})`, 'StaffMemo', memoId);
    }
  };

  // Authentication & Shift Actions
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    let res: Response;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      return { success: false, message: 'Could not reach the server. Please check your connection and try again.' };
    }

    const result = await res.json().catch(() => ({ success: false, message: 'Unexpected server response.' }));
    if (!res.ok || !result.success) {
      return { success: false, message: result.message || 'Login failed.' };
    }

    const matchedUser: UserProfile = result.user;
    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    // The server already set the httpOnly session cookie; this is just a non-sensitive
    // local hint other tabs/components can read without a round trip (never auth-authoritative).
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_current_user', JSON.stringify(matchedUser));
      localStorage.setItem('mode_ops_auth', JSON.stringify({ userId: matchedUser.id, loggedInAt: new Date().toISOString() }));
    }
    setUsers(prev => prev.map(u => (u.id === matchedUser.id ? matchedUser : u)));

    // Daily Shift Tracking: Start of Shift
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const currentShifts = shiftsRef.current && shiftsRef.current.length > 0 ? shiftsRef.current : shifts;
    const activeIdx = currentShifts.findIndex(s => s.staffId === matchedUser.id && s.status === 'active');
    if (activeIdx === -1) {
      const newShift: StaffShift = {
        id: `shift-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        staffId: matchedUser.id,
        staffName: matchedUser.full_name,
        staffEmail: matchedUser.email,
        department: matchedUser.department || 'Operations',
        jobTitle: matchedUser.job_title || 'Staff',
        date: today,
        clockInTime: now,
        clockOutTime: null,
        durationHours: 0,
        status: 'active',
        hourlyRate: matchedUser.hourly_rate || (matchedUser.role === 'managing_director' ? 5000 : matchedUser.role === 'administration' || matchedUser.role === 'accounts' ? 6500 : matchedUser.role === 'developer' ? 3500 : matchedUser.role === 'sales' ? 2800 : matchedUser.role === 'manager' ? 3000 : 2500),
        notes: `Clocked in for regular shift at ${new Date().toLocaleTimeString()}`
      };
      const nextShifts = [newShift, ...currentShifts];
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_shifts', JSON.stringify(nextShifts));
        localStorage.setItem('mode_ops_shifts_timestamp', String(Date.now()));
        window.dispatchEvent(new CustomEvent('mode_ops_shifts_changed', { detail: nextShifts }));
      }
      setShifts(nextShifts);
      syncEntityToServer('shifts', nextShifts);
    }

    logActivity('staff_login', `${matchedUser.full_name} (${matchedUser.job_title || matchedUser.role}) logged in — Shift started.`, 'StaffShift', matchedUser.id);

    return { success: true };
  };

  const logout = () => {
    const now = new Date().toISOString();
    const currentShifts = shiftsRef.current && shiftsRef.current.length > 0 ? shiftsRef.current : shifts;
    const updated = currentShifts.map(s => {
      if (s.staffId === currentUser.id && s.status === 'active') {
        const startMs = Date.parse(s.clockInTime);
        const endMs = Date.parse(now);
        const diffHours = Math.max(0.1, Math.round(((endMs - startMs) / (1000 * 60 * 60)) * 100) / 100);
        return {
          ...s,
          clockOutTime: now,
          durationHours: diffHours,
          status: 'completed' as const,
          notes: `${s.notes || ''} • Clocked out at ${new Date().toLocaleTimeString()} (${diffHours}h shift)`.trim()
        };
      }
      return s;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shifts', JSON.stringify(updated));
      localStorage.setItem('mode_ops_shifts_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_shifts_changed', { detail: updated }));
    }
    setShifts(updated);
    syncEntityToServer('shifts', updated);

    logActivity('staff_logout', `${currentUser.full_name} logged out — Shift closed.`, 'StaffShift', currentUser.id);

    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mode_ops_auth');
      localStorage.removeItem('mode_ops_current_user');
    }
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  // Self-service (no targetUserId: changes the caller's own password) or a manager-tier
  // admin resetting someone else's (targetUserId set) — requires an authenticated session
  // either way. Replaces the old client-only version that accepted any email with zero auth.
  const changeUserPassword = async (newPassword: string, targetUserId?: string, currentPassword?: string): Promise<{ success: boolean; message: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    let res: Response;
    try {
      res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, targetUserId, currentPassword }),
      });
    } catch {
      return { success: false, message: 'Could not reach the server. Please try again.' };
    }

    const result = await res.json().catch(() => ({ success: false, message: 'Unexpected server response.' }));
    if (!res.ok || !result.success) {
      return { success: false, message: result.message || 'Failed to change password.' };
    }

    const effectiveTargetId = targetUserId || currentUser.id;
    const targetProfile = users.find(u => u.id === effectiveTargetId);
    logActivity('password_change', `${targetProfile ? targetProfile.full_name : 'A staff member'}'s password was changed${targetUserId && targetUserId !== currentUser.id ? ` by ${currentUser.full_name}` : ''}.`, 'User', effectiveTargetId);

    return { success: true, message: 'Password changed successfully.' };
  };

  const clockOutStaff = (shiftId: string, customHours?: number, notes?: string) => {
    const now = new Date().toISOString();
    const currentShifts = shiftsRef.current && shiftsRef.current.length > 0 ? shiftsRef.current : shifts;
    const updated = currentShifts.map(s => {
      if (s.id === shiftId) {
        const startMs = Date.parse(s.clockInTime);
        const endMs = Date.parse(now);
        const computedHours = Math.max(0.1, Math.round(((endMs - startMs) / (1000 * 60 * 60)) * 100) / 100);
        const durationHours = customHours !== undefined ? customHours : computedHours;
        return {
          ...s,
          clockOutTime: now,
          durationHours,
          status: 'completed' as const,
          notes: notes || `${s.notes || ''} • Admin clock-out (${durationHours}h)`.trim()
        };
      }
      return s;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shifts', JSON.stringify(updated));
      localStorage.setItem('mode_ops_shifts_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_shifts_changed', { detail: updated }));
    }
    setShifts(updated);
    syncEntityToServer('shifts', updated);

    logActivity('admin_clock_out', `Super Admin closed shift record (${shiftId})`, 'StaffShift', shiftId);
  };

  const clockInStaff = (staffId: string) => {
    const staff = users.find(u => u.id === staffId);
    if (!staff) return;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const currentShifts = shiftsRef.current && shiftsRef.current.length > 0 ? shiftsRef.current : shifts;
    const activeIdx = currentShifts.findIndex(s => s.staffId === staffId && s.status === 'active');
    if (activeIdx !== -1) return;

    const newShift: StaffShift = {
      id: `shift-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.full_name,
      staffEmail: staff.email,
      department: staff.department || 'Operations',
      jobTitle: staff.job_title || 'Staff',
      date: today,
      clockInTime: now,
      clockOutTime: null,
      durationHours: 0,
      status: 'active',
      hourlyRate: staff.hourly_rate || (staff.role === 'managing_director' ? 5000 : staff.role === 'administration' || staff.role === 'accounts' ? 6500 : staff.role === 'developer' ? 3500 : staff.role === 'sales' ? 2800 : staff.role === 'manager' ? 3000 : 2500),
      notes: `Manual clock-in at ${new Date().toLocaleTimeString()}`
    };

    const nextShifts = [newShift, ...currentShifts];
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_shifts', JSON.stringify(nextShifts));
      localStorage.setItem('mode_ops_shifts_timestamp', String(Date.now()));
      window.dispatchEvent(new CustomEvent('mode_ops_shifts_changed', { detail: nextShifts }));
    }
    setShifts(nextShifts);
    syncEntityToServer('shifts', nextShifts);

    logActivity('admin_clock_in', `Clock-in recorded for ${staff.full_name}`, 'StaffShift', staffId);
  };

  const applyShiftHoursToPayroll = (staffId: string, period = 'September 2026') => {
    const staffShifts = shifts.filter(s => s.staffId === staffId && s.status === 'completed');
    const totalHours = Math.round(staffShifts.reduce((acc, curr) => acc + (curr.durationHours || 0), 0) * 10) / 10;
    const staffRate = staffShifts[0]?.hourlyRate || 2500;
    const shiftPayTotal = Math.round(totalHours * staffRate);

    setPayrollRecords(prev => prev.map(p => {
      if (p.staffId === staffId && p.period === period) {
        return {
          ...p,
          shiftHours: totalHours,
          shiftHourlyRate: staffRate,
          notes: `${p.notes || ''} [Reconciled: ${totalHours} verified shift hours @ ₦${staffRate.toLocaleString()}/hr]`.trim()
        };
      }
      return p;
    }));

    logActivity('shift_payroll_sync', `Reconciled ${totalHours} shift hours for ${staffId} in payroll (${period})`, 'Payroll', staffId);

    return { hours: totalHours, amount: shiftPayTotal };
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        login,
        logout,
        changeUserPassword,
        shifts,
        activeShift,
        clockOutStaff,
        clockInStaff,
        applyShiftHoursToPayroll,
        currentUser,
        viewAsUser,
        effectiveUser,
        setViewAsUser,
        users,
        updateUserProfile,
        addUserProfile,
        deleteUserProfile,
        leads,
        addLead,
        updateLeadStatus,
        updateLead,
        deleteLead,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        projects,
        addProject,
        updateProject,
        deleteProject,
        tasks,
        toggleTask,
        addTask,
        updateTask,
        deleteTask,
        shiftTasks,
        addShiftTask,
        toggleShiftTask,
        updateShiftTask,
        deleteShiftTask,
        moveShiftTaskToNextDay,
        completeShiftReview,
        shiftReviewModalOpen,
        setShiftReviewModalOpen,
        resumeShiftModalOpen,
        setResumeShiftModalOpen,
        services,
        addService,
        updateService,
        deleteService,
        hostingAccounts,
        renewHosting,
        whmcsConfig,
        updateWhmcsConfig,
        syncWhmcsHosting,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordPayment,
        payments,
        payrollRecords,
        addPayrollRecord,
        updatePayrollRecord,
        deletePayrollRecord,
        processPayrollBatch,
        setStaffPayrollAccess,
        tickets,
        addTicket,
        updateTicketStatus,
        requisitions,
        createRequisition,
        updateRequisition,
        deleteRequisition,
        updateRequisitionDecision,
        disburseRequisition,
        goals,
        addGoal,
        updateGoalProgress,
        updateGoal,
        deleteGoal,
        submitGoalStrategy,
        approveGoalStrategy,
        requestGoalStrategyRevision,
        feedbacks,
        addFeedback,
        activities,
        notifications,
        markNotificationAsRead,
        memos,
        sendMemo,
        markMemoAsRead,
        acknowledgeMemo,
        deleteMemo,
        syncDeltaToServer,
        syncEntityToServer,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        toggleMobileSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
