'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserProfile, Lead, Contact, Company, Project, Task, Service, HostingAccount,
  Invoice, Payment, Ticket, ActivityItem, Requisition, Goal, Feedback, AppNotification,
  UserRole, LeadStatus, RequisitionStatus, GoalStatus, WhmcsConfig
} from './types';
import {
  initialProfiles, initialLeads, initialContacts, initialCompanies,
  initialProjects, initialTasks, initialServices, initialHostingAccounts,
  initialInvoices, initialPayments, initialRequisitions, initialGoals,
  initialFeedbacks, initialTickets, initialActivities, initialNotifications
} from './seed-data';
import { generateReceiptNumber } from './utils';

interface AppContextType {
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
  syncWhmcsHosting: () => Promise<{ success: boolean; count?: number; message?: string }>;

  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  recordPayment: (invoiceId: string, amount: number, method: Payment['method'], reference?: string) => void;
  payments: Payment[];

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
          return parsed.map((u: UserProfile) => {
            if (u.id === 'u1' && (u.full_name?.includes('Adewale') || u.email?.includes('adewale'))) {
              return { ...u, full_name: 'Davids Ogan', email: 'davids@modedigital.ng' };
            }
            return u;
          });
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
    }
  }, [leads, users, companies, projects, services, requisitions, goals, invoices, hostingAccounts, whmcsConfig, tasks, feedbacks, tickets, activities, notifications]);

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

  const syncWhmcsHosting = async (): Promise<{ success: boolean; count?: number; message?: string }> => {
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
      return { success: false, message: data?.error || 'Failed to sync' };
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

  return (
    <AppContext.Provider
      value={{
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
        recordPayment,
        payments,
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
