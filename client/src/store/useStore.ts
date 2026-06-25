import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Lead, Contact, Company, Project, Task, Service, HostingAccount,
  Invoice, Payment, Ticket, Activity, EmailCampaign, User, StaffPerformance,
} from '@/types';
import { seedData } from '@/lib/seed-data';

interface CRMState {
  currentUser: User;
  users: User[];
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  projects: Project[];
  tasks: Task[];
  services: Service[];
  hostingAccounts: HostingAccount[];
  invoices: Invoice[];
  payments: Payment[];
  tickets: Ticket[];
  activities: Activity[];
  emailCampaigns: EmailCampaign[];

  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  addCompany: (company: Company) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addService: (service: Service) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addHostingAccount: (account: HostingAccount) => void;
  updateHostingAccount: (id: string, updates: Partial<HostingAccount>) => void;
  deleteHostingAccount: (id: string) => void;

  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  addPayment: (payment: Payment) => void;

  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;

  addActivity: (activity: Activity) => void;

  addEmailCampaign: (campaign: EmailCampaign) => void;
  updateEmailCampaign: (id: string, updates: Partial<EmailCampaign>) => void;
  deleteEmailCampaign: (id: string) => void;

  resetToSeedData: () => void;
}

export const useStore = create<CRMState>()(
  persist(
    (set) => ({
      ...seedData,

      addLead: (lead) => set((s) => ({ leads: [...s.leads, lead] })),
      updateLead: (id, updates) =>
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l)),
        })),
      deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),

      addContact: (contact) => set((s) => ({ contacts: [...s.contacts, contact] })),
      updateContact: (id, updates) =>
        set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)) })),
      deleteContact: (id) => set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      addCompany: (company) => set((s) => ({ companies: [...s.companies, company] })),
      updateCompany: (id, updates) =>
        set((s) => ({ companies: s.companies.map((c) => (c.id === id ? { ...c, ...updates } : c)) })),
      deleteCompany: (id) => set((s) => ({ companies: s.companies.filter((c) => c.id !== id) })),

      addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
      updateProject: (id, updates) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, updates) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addService: (service) => set((s) => ({ services: [...s.services, service] })),
      updateService: (id, updates) =>
        set((s) => ({ services: s.services.map((sv) => (sv.id === id ? { ...sv, ...updates } : sv)) })),
      deleteService: (id) => set((s) => ({ services: s.services.filter((sv) => sv.id !== id) })),

      addHostingAccount: (account) => set((s) => ({ hostingAccounts: [...s.hostingAccounts, account] })),
      updateHostingAccount: (id, updates) =>
        set((s) => ({
          hostingAccounts: s.hostingAccounts.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),
      deleteHostingAccount: (id) =>
        set((s) => ({ hostingAccounts: s.hostingAccounts.filter((h) => h.id !== id) })),

      addInvoice: (invoice) => set((s) => ({ invoices: [...s.invoices, invoice] })),
      updateInvoice: (id, updates) =>
        set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)) })),
      deleteInvoice: (id) => set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),

      addPayment: (payment) =>
        set((s) => {
          const invoice = s.invoices.find((i) => i.id === payment.invoiceId);
          if (!invoice) return { payments: [...s.payments, payment] };
          const newAmountPaid = invoice.amountPaid + payment.amount;
          const newStatus = newAmountPaid >= invoice.total ? 'paid' : 'partially-paid';
          return {
            payments: [...s.payments, payment],
            invoices: s.invoices.map((i) =>
              i.id === payment.invoiceId ? { ...i, amountPaid: newAmountPaid, status: newStatus as any } : i
            ),
          };
        }),

      addTicket: (ticket) => set((s) => ({ tickets: [...s.tickets, ticket] })),
      updateTicket: (id, updates) =>
        set((s) => ({
          tickets: s.tickets.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
        })),
      deleteTicket: (id) => set((s) => ({ tickets: s.tickets.filter((t) => t.id !== id) })),

      addActivity: (activity) => set((s) => ({ activities: [activity, ...s.activities] })),

      addEmailCampaign: (campaign) => set((s) => ({ emailCampaigns: [...s.emailCampaigns, campaign] })),
      updateEmailCampaign: (id, updates) =>
        set((s) => ({ emailCampaigns: s.emailCampaigns.map((e) => (e.id === id ? { ...e, ...updates } : e)) })),
      deleteEmailCampaign: (id) => set((s) => ({ emailCampaigns: s.emailCampaigns.filter((e) => e.id !== id) })),

      resetToSeedData: () => set(seedData),
    }),
    { name: 'mode-crm-store' }
  )
);
