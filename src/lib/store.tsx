'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserProfile, Lead, Contact, Company, Project, Task, Service, HostingAccount,
  Invoice, Payment, Ticket, ActivityItem, Requisition, Goal, Feedback, AppNotification,
  UserRole, LeadStatus, RequisitionStatus, GoalStatus
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

  // CRM
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  deleteLead: (id: string) => void;

  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;

  companies: Company[];
  projects: Project[];
  tasks: Task[];
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;

  services: Service[];
  hostingAccounts: HostingAccount[];
  renewHosting: (id: string, additionalMonths?: number) => void;

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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialProfiles[0]);
  const [users] = useState<UserProfile[]>(initialProfiles);

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

  const [companies] = useState<Company[]>(initialCompanies);
  const [projects] = useState<Project[]>(initialProjects);

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_tasks');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialTasks;
  });

  const [services] = useState<Service[]>(initialServices);

  const [hostingAccounts, setHostingAccounts] = useState<HostingAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mode_ops_hosting');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return initialHostingAccounts;
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

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_leads', JSON.stringify(leads));
      localStorage.setItem('mode_ops_requisitions', JSON.stringify(requisitions));
      localStorage.setItem('mode_ops_goals', JSON.stringify(goals));
      localStorage.setItem('mode_ops_invoices', JSON.stringify(invoices));
      localStorage.setItem('mode_ops_hosting', JSON.stringify(hostingAccounts));
      localStorage.setItem('mode_ops_tasks', JSON.stringify(tasks));
      localStorage.setItem('mode_ops_feedbacks', JSON.stringify(feedbacks));
      localStorage.setItem('mode_ops_tickets', JSON.stringify(tickets));
      localStorage.setItem('mode_ops_activities', JSON.stringify(activities));
      localStorage.setItem('mode_ops_notifications', JSON.stringify(notifications));
    }
  }, [leads, requisitions, goals, invoices, hostingAccounts, tasks, feedbacks, tickets, activities, notifications]);

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
        leads,
        addLead,
        updateLeadStatus,
        deleteLead,
        contacts,
        addContact,
        companies,
        projects,
        tasks,
        toggleTask,
        addTask,
        services,
        hostingAccounts,
        renewHosting,
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
