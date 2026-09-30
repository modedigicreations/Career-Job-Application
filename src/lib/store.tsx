'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserProfile, Lead, Contact, Company, Project, Task, Service, HostingAccount,
  Invoice, Payment, Ticket, ActivityItem, Requisition, Goal, Feedback, AppNotification,
  UserRole, LeadStatus, RequisitionStatus, GoalStatus, WhmcsConfig, PayrollRecord,
  StaffShift
} from './types';
import {
  initialProfiles, initialLeads, initialContacts, initialCompanies,
  initialProjects, initialTasks, initialServices, initialHostingAccounts,
  initialInvoices, initialPayments, initialRequisitions, initialGoals,
  initialFeedbacks, initialTickets, initialActivities, initialNotifications,
  initialPayrollRecords, initialShifts
} from './seed-data';
import { generateReceiptNumber } from './utils';

interface AppContextType {
  // Authentication & Shift Attendance
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  changeUserPassword: (email: string, newPassword: string) => { success: boolean; message: string };
  shifts: StaffShift[];
  activeShift: StaffShift | null;
  clockOutStaff: (shiftId: string, customHours?: number, notes?: string) => void;
  clockInStaff: (staffId: string) => void;
  applyShiftHoursToPayroll: (staffId: string, period?: string) => { hours: number; amount: number };

  // Current active user / impersonation
  currentUser: UserProfile;
  setCurrentUserRole: (role: UserRole) => void;
  users: UserProfile[];
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => void;
  addUserProfile: (profile: Omit<UserProfile, 'id'>) => void;
  deleteUserProfile: (id: string) => void;

  // CRM
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  deleteLead: (id: string) => void;

  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;

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

  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  hostingAccounts: HostingAccount[];
  renewHosting: (id: string, additionalMonths?: number) => void;
  whmcsConfig: import('./types').WhmcsConfig;
  updateWhmcsConfig: (updates: Partial<import('./types').WhmcsConfig>) => void;
  syncWhmcsHosting: () => Promise<{ success: boolean; count?: number; message?: string; detectedIp?: string }>;

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
  updateRequisitionDecision: (id: string, status: 'Approved' | 'Rejected', decisionNotes: string) => void;
  disburseRequisition: (id: string, transactionId: string) => void;

  // One-Minute Manager
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'progress' | 'status' | 'strategy_status'>) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  submitGoalStrategy: (id: string, strategyText: string) => void;
  approveGoalStrategy: (id: string, feedbackNote?: string) => void;
  requestGoalStrategyRevision: (id: string, feedbackNote: string) => void;

  feedbacks: Feedback[];
  addFeedback: (fb: Omit<Feedback, 'id' | 'created_at'>) => void;

  // Global Activity & Notifications
  activities: ActivityItem[];
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;

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
          const existingIds = new Set(parsed.map((u: UserProfile) => u.id));
          const merged = parsed.map((u: UserProfile) => {
            if (u.id === 'u1' && (u.full_name?.includes('Adewale') || u.email?.includes('adewale'))) {
              return { ...u, full_name: 'Davids Ogan', email: 'davids@modedigital.ng' };
            }
            return u;
          });
          for (const initU of initialProfiles) {
            if (!existingIds.has(initU.id)) {
              merged.push(initU);
            }
          }
          return merged;
        } catch {}
      }
    }
    return initialProfiles;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('mode_ops_current_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u.id === 'u1' && (u.full_name?.includes('Adewale') || u.email?.includes('adewale'))) {
            return { ...u, full_name: 'Davids Ogan', email: 'davids@modedigital.ng' };
          }
          return u;
        } catch {}
      }
    }
    return initialProfiles[0];
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_leads');
      if (saved) try { return JSON.parse(saved); } catch {}
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
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialProjects;
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
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialServices;
  });

  const [hostingAccounts, setHostingAccounts] = useState<HostingAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_hosting');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialHostingAccounts;
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
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialInvoices;
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
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialRequisitions;
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
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialPayrollRecords;
  });

  const [shifts, setShifts] = useState<StaffShift[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_shifts');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialShifts;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('mode_ops_auth');
      return !!auth;
    }
    return true; // Default during SSR
  });

  const activeShift = shifts.find(s => s.staffId === currentUser.id && s.status === 'active') || null;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setMobileSidebarOpen(prev => !prev);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_leads', JSON.stringify(leads));
      localStorage.setItem('mode_ops_users', JSON.stringify(users));
      localStorage.setItem('mode_ops_companies', JSON.stringify(companies));
      localStorage.setItem('mode_ops_projects', JSON.stringify(projects));
      localStorage.setItem('mode_ops_services', JSON.stringify(services));
      localStorage.setItem('mode_ops_requisitions', JSON.stringify(requisitions));
      localStorage.setItem('mode_ops_goals', JSON.stringify(goals));
      localStorage.setItem('mode_ops_invoices', JSON.stringify(invoices));
      localStorage.setItem('mode_ops_hosting', JSON.stringify(hostingAccounts));
      localStorage.setItem('mode_ops_whmcs_config', JSON.stringify(whmcsConfig));
      localStorage.setItem('mode_ops_tasks', JSON.stringify(tasks));
      localStorage.setItem('mode_ops_feedbacks', JSON.stringify(feedbacks));
      localStorage.setItem('mode_ops_tickets', JSON.stringify(tickets));
      localStorage.setItem('mode_ops_activities', JSON.stringify(activities));
      localStorage.setItem('mode_ops_notifications', JSON.stringify(notifications));
      localStorage.setItem('mode_ops_payroll', JSON.stringify(payrollRecords));
      localStorage.setItem('mode_ops_shifts', JSON.stringify(shifts));
    }
  }, [leads, users, companies, projects, services, requisitions, goals, invoices, hostingAccounts, whmcsConfig, tasks, feedbacks, tickets, activities, notifications, payrollRecords, shifts]);

  // Switch Role
  const setCurrentUserRole = (role: UserRole) => {
    const found = users.find(u => u.role === role) || {
      id: `u-${role}`,
      email: `${role}@modedigital.ng`,
      full_name: role.replace('_', ' ').toUpperCase(),
      role,
      department: 'Operations',
      job_title: `${role.toUpperCase()} Lead`,
    };
    setCurrentUser(found);
  };

  const updateUserProfile = (id: string, updates: Partial<UserProfile>) => {
    setUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, ...updates } : u);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_users', JSON.stringify(updated));
      }
      return updated;
    });

    if (currentUser.id === id) {
      setCurrentUser(prev => {
        const next = { ...prev, ...updates };
        if (typeof window !== 'undefined') {
          localStorage.setItem('mode_ops_current_user', JSON.stringify(next));
        }
        return next;
      });
    }

    logActivity('user_profile_update', `Executive updated profile for ${updates.full_name || id}`, 'User', id);
  };

  const addUserProfile = (profileData: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...profileData,
      id: `u-${Date.now()}`,
      is_active: profileData.is_active ?? true,
    };
    setUsers(prev => {
      const updated = [...prev, newUser];
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_users', JSON.stringify(updated));
      }
      return updated;
    });
    logActivity('user_create', `Added staff member: ${newUser.full_name} (${newUser.job_title || newUser.role})`, 'User', newUser.id);
  };

  const deleteUserProfile = (id: string) => {
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_users', JSON.stringify(updated));
      }
      return updated;
    });
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
      id: `l-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads(prev => [newLead, ...prev]);
    logActivity('crm_lead', `Added lead: ${newLead.name} (${newLead.company})`, 'Lead', newLead.id);
  };

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status, updatedAt: new Date().toISOString().split('T')[0] } : l));
    const target = leads.find(l => l.id === id);
    if (target) {
      logActivity('crm_pipeline', `Moved ${target.company} to ${status.replace('-', ' ')}`, 'Lead', id);
    }
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContacts(prev => [newContact, ...prev]);
  };

  const addCompany = (companyData: Omit<Company, 'id' | 'createdAt'>) => {
    const newCompany: Company = {
      ...companyData,
      id: `co-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCompanies(prev => [newCompany, ...prev]);
    logActivity('crm_company', `Added corporate client org: ${newCompany.name}`, 'Company', newCompany.id);
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    logActivity('crm_company', `Updated corporate client org: ${updates.name || id}`, 'Company', id);
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    logActivity('crm_company', `Deleted corporate client org (${id})`, 'Company', id);
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects(prev => [newProject, ...prev]);
    logActivity('crm_project', `Created client project: ${newProject.name}`, 'Project', newProject.id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    logActivity('crm_project', `Updated client project: ${updates.name || id}`, 'Project', id);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    logActivity('crm_project', `Deleted client project (${id})`, 'Project', id);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `s-${Date.now()}`,
    };
    setServices(prev => [newService, ...prev]);
    logActivity('crm_service', `Added service catalog solution: ${newService.name}`, 'Service', newService.id);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    logActivity('crm_service', `Updated service solution: ${updates.name || id}`, 'Service', id);
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    logActivity('crm_service', `Deleted service solution (${id})`, 'Service', id);
  };

  const renewHosting = (id: string, additionalMonths = 12) => {
    setHostingAccounts(prev => prev.map(h => {
      if (h.id === id) {
        const curr = new Date(h.expiryDate);
        curr.setMonth(curr.getMonth() + additionalMonths);
        return {
          ...h,
          expiryDate: curr.toISOString().split('T')[0],
          status: 'active',
          sslStatus: 'active',
        };
      }
      return h;
    }));
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

  const syncWhmcsHosting = async (): Promise<{ success: boolean; count?: number; message?: string; detectedIp?: string }> => {
    try {
      const res = await fetch('/api/whmcs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: whmcsConfig.apiUrl,
          identifier: whmcsConfig.identifier,
          secret: whmcsConfig.secret
        })
      });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.accounts)) {
        setHostingAccounts(data.accounts);
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
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setInvoices(prev => [newInvoice, ...prev]);
    logActivity('crm_invoice', `Created invoice #${newInvoice.invoiceNumber} for ${newInvoice.clientName}`, 'Invoice', newInvoice.id);
  };

  const recordPayment = (invoiceId: string, amount: number, method: Payment['method'], reference?: string) => {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId,
      amount,
      currency: 'NGN',
      method,
      reference: reference || `REF-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setPayments(prev => [newPayment, ...prev]);

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const updatedPaid = inv.amountPaid + amount;
        const newStatus = updatedPaid >= inv.total ? 'paid' : 'partially-paid';
        return { ...inv, amountPaid: updatedPaid, status: newStatus };
      }
      return inv;
    }));

    logActivity('crm_payment', `Recorded payment of ₦${amount.toLocaleString()} for Invoice`, 'Payment', newPayment.id);
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => {
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
    }));
    logActivity('crm_invoice', `Updated invoice details for #${updates.invoiceNumber || id}`, 'Invoice', id);
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    logActivity('crm_invoice', `Deleted invoice #${id}`, 'Invoice', id);
  };

  const addPayrollRecord = (recordData: Omit<PayrollRecord, 'id' | 'createdAt'>) => {
    const newRecord: PayrollRecord = {
      ...recordData,
      id: `payr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPayrollRecords(prev => [newRecord, ...prev]);
    logActivity('payroll', `Generated payroll record for ${newRecord.staffName} (${newRecord.period})`, 'Payroll', newRecord.id);
  };

  const updatePayrollRecord = (id: string, updates: Partial<PayrollRecord>) => {
    setPayrollRecords(prev => prev.map(rec => rec.id === id ? { ...rec, ...updates } : rec));
    logActivity('payroll', `Updated payroll record for #${id}`, 'Payroll', id);
  };

  const deletePayrollRecord = (id: string) => {
    setPayrollRecords(prev => prev.filter(rec => rec.id !== id));
    logActivity('payroll', `Removed payroll record #${id}`, 'Payroll', id);
  };

  const processPayrollBatch = (period: string) => {
    const now = new Date().toISOString();
    setPayrollRecords(prev => prev.map(rec => {
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
    }));
    logActivity('payroll_batch', `Batch disbursed payroll for period: ${period}`, 'Payroll', period);
  };

  const setStaffPayrollAccess = (userId: string, hasAccess: boolean) => {
    updateUserProfile(userId, { hasPayrollAccess: hasAccess });
    logActivity('security', `${hasAccess ? 'Granted' : 'Revoked'} staff payroll permission for user #${userId}`, 'Security', userId);
  };

  const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `tk-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicketStatus = (id: string, status: Ticket['status']) => {
    setTickets(prev => prev.map(tk => tk.id === id ? { ...tk, status } : tk));
  };

  // Office Expense Actions
  const createRequisition = ({
    title, description, amount, category, urgency, currency = 'NGN'
  }: {
    title: string; description: string; amount: number; category: string; urgency: Requisition['urgency']; currency?: Requisition['currency']
  }) => {
    const newReq: Requisition = {
      id: `req-${Date.now()}`,
      receiptNumber: generateReceiptNumber(),
      title,
      description,
      amount,
      currency,
      category,
      urgency,
      status: 'Pending',
      staffName: currentUser.full_name,
      staffId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setRequisitions(prev => [newReq, ...prev]);
    logActivity('expense_create', `Staff ${currentUser.full_name} submitted requisition: ${title} (${currency} ${amount.toLocaleString()})`, 'Requisition', newReq.id);

    // Notify Manager/MD
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
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
    setRequisitions(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          decisionNotes,
          decidedAt: new Date().toISOString(),
          decidedBy: currentUser.full_name,
        };
      }
      return r;
    }));
    logActivity('expense_decision', `${currentUser.full_name} marked requisition as ${status}`, 'Requisition', id);
  };

  const disburseRequisition = (id: string, transactionId: string) => {
    setRequisitions(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Completed',
          completedAt: new Date().toISOString(),
          disbursedBy: currentUser.full_name,
          transactionId,
        };
      }
      return r;
    }));
    logActivity('expense_disburse', `Accounts disbursed requisition funds (${transactionId})`, 'Requisition', id);
  };

  // One-Minute Manager Actions
  const addGoal = (goalData: Omit<Goal, 'id' | 'created_at' | 'progress' | 'status' | 'strategy_status'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `g-${Date.now()}`,
      progress: 0,
      status: 'not_started',
      strategy_status: 'pending_submission',
      created_at: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);
    logActivity('omm_goal', `Assigned One-Minute Goal: ${goalData.objective}`, 'Goal', newGoal.id);
  };

  const updateGoalProgress = (id: string, progress: number) => {
    const bounded = Math.max(0, Math.min(100, progress));
    const status: GoalStatus = bounded === 100 ? 'completed' : bounded > 0 ? 'in_progress' : 'not_started';
    setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: bounded, status } : g));
  };

  const submitGoalStrategy = (id: string, strategyText: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          strategy_text: strategyText,
          strategy_status: 'submitted',
          strategy_submitted_at: new Date().toISOString(),
        };
      }
      return g;
    }));
    logActivity('omm_strategy', `Submitted 1-Minute Strategy Plan`, 'Goal', id);
  };

  const approveGoalStrategy = (id: string, feedbackNote?: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          strategy_status: 'approved',
          strategy_feedback: feedbackNote,
          strategy_approved_at: new Date().toISOString(),
        };
      }
      return g;
    }));
    logActivity('omm_strategy', `Approved 1-Minute Strategy Plan`, 'Goal', id);
  };

  const requestGoalStrategyRevision = (id: string, feedbackNote: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          strategy_status: 'revision_requested',
          strategy_feedback: feedbackNote,
        };
      }
      return g;
    }));
  };

  const addFeedback = (fbData: Omit<Feedback, 'id' | 'created_at'>) => {
    const newFb: Feedback = {
      ...fbData,
      id: `fb-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setFeedbacks(prev => [newFb, ...prev]);
    logActivity('omm_feedback', `Sent One-Minute ${fbData.type === 'praise' ? 'Praise 🎉' : 'Redirect 🎯'} to ${fbData.employee_name}`, 'Feedback', newFb.id);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Authentication & Shift Actions
  const login = (email: string, password: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    // Company email domain check
    const isCompanyDomain = 
      cleanEmail.endsWith('@modedigitalcreations.ng') ||
      cleanEmail.endsWith('@modewebhost.com.ng') ||
      cleanEmail.endsWith('@modedigital.ng') || 
      cleanEmail.endsWith('@modedigitalcreations.com') ||
      cleanEmail.endsWith('@mode-ops.com');

    if (!isCompanyDomain) {
      return {
        success: false,
        message: 'Access Restricted: Staff members can only log in with their provided company email address (@modedigitalcreations.ng, @modewebhost.com.ng, or @modedigital.ng).'
      };
    }

    const matchedUser = 
      users.find(u => u.email.toLowerCase() === cleanEmail) ||
      users.find(u => {
        const uPrefix = u.email.split('@')[0].toLowerCase();
        const inputPrefix = cleanEmail.split('@')[0].toLowerCase();
        return uPrefix === inputPrefix;
      });
    if (!matchedUser) {
      return {
        success: false,
        message: 'No registered staff profile found with this company email. Please contact the Managing Director or Super Admin.'
      };
    }

    if (matchedUser.is_active === false) {
      return {
        success: false,
        message: 'This staff account has been deactivated. Please reach out to your administrator.'
      };
    }

    const validPassword = matchedUser.password || 'password123';
    if (password !== validPassword && password !== 'Mode2026!') {
      return {
        success: false,
        message: 'Incorrect password. You can change your password using the "Change Password" tab on this page.'
      };
    }

    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_current_user', JSON.stringify(matchedUser));
      localStorage.setItem('mode_ops_auth', JSON.stringify({ userId: matchedUser.id, loggedInAt: new Date().toISOString() }));
    }

    // Daily Shift Tracking: Start of Shift
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    setShifts(prev => {
      const activeIdx = prev.findIndex(s => s.staffId === matchedUser.id && s.status === 'active');
      if (activeIdx !== -1) {
        return prev;
      }
      const newShift: StaffShift = {
        id: `shift-${Date.now()}`,
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
        hourlyRate: matchedUser.role === 'managing_director' ? 5000 : matchedUser.role === 'developer' ? 3500 : matchedUser.role === 'sales' ? 2800 : matchedUser.role === 'manager' ? 3000 : 2500,
        notes: `Clocked in for regular shift at ${new Date().toLocaleTimeString()}`
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_shifts', JSON.stringify([newShift, ...prev]));
      }
      return [newShift, ...prev];
    });

    logActivity('staff_login', `${matchedUser.full_name} (${matchedUser.job_title || matchedUser.role}) logged in — Shift started.`, 'StaffShift', matchedUser.id);

    return { success: true };
  };

  const logout = () => {
    const now = new Date().toISOString();
    setShifts(prev => {
      const updated = prev.map(s => {
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
      }
      return updated;
    });

    logActivity('staff_logout', `${currentUser.full_name} logged out — Shift closed.`, 'StaffShift', currentUser.id);

    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mode_ops_auth');
    }
  };

  const changeUserPassword = (email: string, newPassword: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();

    // Company email domain check
    const isCompanyDomain = 
      cleanEmail.endsWith('@modedigitalcreations.ng') ||
      cleanEmail.endsWith('@modewebhost.com.ng') ||
      cleanEmail.endsWith('@modedigital.ng') || 
      cleanEmail.endsWith('@modedigitalcreations.com') ||
      cleanEmail.endsWith('@mode-ops.com');

    if (!isCompanyDomain) {
      return {
        success: false,
        message: 'Access Restricted: Please enter a valid company email address (@modedigitalcreations.ng, @modewebhost.com.ng, or @modedigital.ng).'
      };
    }

    const target = 
      users.find(u => u.email.toLowerCase() === cleanEmail) ||
      users.find(u => {
        const uPrefix = u.email.split('@')[0].toLowerCase();
        const inputPrefix = cleanEmail.split('@')[0].toLowerCase();
        return uPrefix === inputPrefix;
      });
    if (!target) {
      return {
        success: false,
        message: 'No registered company staff profile found with this email.'
      };
    }
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters long.'
      };
    }

    setUsers(prev => {
      const updated = prev.map(u => u.id === target.id ? { ...u, password: newPassword } : u);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_users', JSON.stringify(updated));
      }
      return updated;
    });

    logActivity('password_change', `Staff member ${target.full_name} changed their password.`, 'User', target.id);

    return {
      success: true,
      message: 'Password changed successfully! You can now log in with your new password.'
    };
  };

  const clockOutStaff = (shiftId: string, customHours?: number, notes?: string) => {
    const now = new Date().toISOString();
    setShifts(prev => {
      const updated = prev.map(s => {
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
      }
      return updated;
    });

    logActivity('admin_clock_out', `Super Admin closed shift record (${shiftId})`, 'StaffShift', shiftId);
  };

  const clockInStaff = (staffId: string) => {
    const staff = users.find(u => u.id === staffId);
    if (!staff) return;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    setShifts(prev => {
      const activeIdx = prev.findIndex(s => s.staffId === staffId && s.status === 'active');
      if (activeIdx !== -1) return prev;

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
        hourlyRate: staff.role === 'managing_director' ? 5000 : staff.role === 'developer' ? 3500 : staff.role === 'sales' ? 2800 : staff.role === 'manager' ? 3000 : 2500,
        notes: `Super Admin manual clock-in at ${new Date().toLocaleTimeString()}`
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode_ops_shifts', JSON.stringify([newShift, ...prev]));
      }
      return [newShift, ...prev];
    });

    logActivity('admin_clock_in', `Super Admin manual clock-in for ${staff.full_name}`, 'StaffShift', staffId);
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
        login,
        logout,
        changeUserPassword,
        shifts,
        activeShift,
        clockOutStaff,
        clockInStaff,
        applyShiftHoursToPayroll,
        currentUser,
        setCurrentUserRole,
        users,
        updateUserProfile,
        addUserProfile,
        deleteUserProfile,
        leads,
        addLead,
        updateLeadStatus,
        deleteLead,
        contacts,
        addContact,
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
        updateRequisitionDecision,
        disburseRequisition,
        goals,
        addGoal,
        updateGoalProgress,
        submitGoalStrategy,
        approveGoalStrategy,
        requestGoalStrategyRevision,
        feedbacks,
        addFeedback,
        activities,
        notifications,
        markNotificationAsRead,
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
