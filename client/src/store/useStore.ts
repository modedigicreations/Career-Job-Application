import { create } from 'zustand';
import type {
  Lead, Contact, Company, Project, Task, Service, HostingAccount,
  Invoice, Payment, Ticket, Activity, EmailCampaign, User, PersonalGoal, ManagerTask, Requisition,
} from '@/types';
import { api, getToken, setToken, setUnauthorizedHandler, ApiError } from '@/lib/api';
import { showToast } from '@/components/ui/Toast';

const EMPTY_USER: User = { id: '', name: '', email: '', role: 'sales', phone: '', isActive: true, createdAt: '' };

type NewEntity<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

interface CRMState {
  isAuthenticated: boolean;
  authLoading: boolean;
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
  personalGoals: PersonalGoal[];
  managerTasks: ManagerTask[];
  requisitions: Requisition[];

  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadAll: () => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  addStaff: (staff: { name: string; email: string; password: string; role: string; phone?: string }) => Promise<void>;

  addLead: (lead: NewEntity<Lead>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  addContact: (contact: NewEntity<Contact>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  addCompany: (company: NewEntity<Company>) => Promise<void>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;

  addProject: (project: NewEntity<Project>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addTask: (task: NewEntity<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addService: (service: NewEntity<Service>) => Promise<void>;
  updateService: (id: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  addHostingAccount: (account: NewEntity<HostingAccount>) => Promise<void>;
  updateHostingAccount: (id: string, updates: Partial<HostingAccount>) => Promise<void>;
  deleteHostingAccount: (id: string) => Promise<void>;

  addInvoice: (invoice: NewEntity<Invoice>) => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;

  addTicket: (ticket: NewEntity<Ticket>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;

  addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;

  addEmailCampaign: (campaign: NewEntity<EmailCampaign>) => Promise<void>;
  updateEmailCampaign: (id: string, updates: Partial<EmailCampaign>) => Promise<void>;
  deleteEmailCampaign: (id: string) => Promise<void>;

  addPersonalGoal: (goal: Omit<PersonalGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePersonalGoal: (id: string, updates: Partial<PersonalGoal>) => Promise<void>;
  deletePersonalGoal: (id: string) => Promise<void>;

  addManagerTask: (task: Omit<ManagerTask, 'id' | 'assignedBy' | 'assignee' | 'creator' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateManagerTask: (id: string, updates: Partial<ManagerTask>) => Promise<void>;
  deleteManagerTask: (id: string) => Promise<void>;

  addRequisition: (req: Omit<Requisition, 'id' | 'requestedBy' | 'requester' | 'approver' | 'approvedBy' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  approveRequisition: (id: string) => Promise<void>;
  rejectRequisition: (id: string) => Promise<void>;
  deleteRequisition: (id: string) => Promise<void>;
}

export const useStore = create<CRMState>()((set, get) => ({
  isAuthenticated: false,
  authLoading: true,
  currentUser: EMPTY_USER,
  users: [],
  leads: [],
  contacts: [],
  companies: [],
  projects: [],
  tasks: [],
  services: [],
  hostingAccounts: [],
  invoices: [],
  payments: [],
  tickets: [],
  activities: [],
  emailCampaigns: [],
  personalGoals: [],
  managerTasks: [],
  requisitions: [],

  initAuth: async () => {
    if (!getToken()) {
      set({ authLoading: false });
      return;
    }
    try {
      const user = await api.get<User>('/auth/me');
      set({ currentUser: user, isAuthenticated: true });
      // Keep the splash spinner up until the data is actually there too — otherwise
      // a deep link (e.g. /projects/:id) briefly renders against empty arrays and
      // shows a false "not found" before loadAll() finishes.
      try {
        await get().loadAll();
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Some data failed to load — try refreshing.', 'error');
      }
      set({ authLoading: false });
    } catch {
      setToken(null);
      set({ isAuthenticated: false, authLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    setToken(res.token);
    set({ currentUser: res.user });
    // Only flip isAuthenticated (which unmounts the login form) once the app's
    // data has actually loaded — otherwise a loadAll() failure throws into an
    // already-unmounted LoginPage and the user is left "logged in" with every
    // list silently empty and no error shown.
    await get().loadAll();
    set({ isAuthenticated: true });
  },

  logout: () => {
    setToken(null);
    set({
      isAuthenticated: false, currentUser: EMPTY_USER,
      users: [], leads: [], contacts: [], companies: [], projects: [], tasks: [],
      services: [], hostingAccounts: [], invoices: [], payments: [], tickets: [],
      activities: [], emailCampaigns: [], personalGoals: [], managerTasks: [], requisitions: [],
    });
  },

  loadAll: async () => {
    const [users, leads, contacts, companies, projects, tasks, services, hostingAccounts, invoices, payments, tickets, activities, emailCampaigns, personalGoals, managerTasks, requisitions] = await Promise.all([
      api.get<User[]>('/users'),
      api.get<Lead[]>('/leads'),
      api.get<Contact[]>('/contacts'),
      api.get<Company[]>('/companies'),
      api.get<Project[]>('/projects'),
      api.get<Task[]>('/tasks'),
      api.get<Service[]>('/services'),
      api.get<HostingAccount[]>('/hosting'),
      api.get<Invoice[]>('/invoices'),
      api.get<Payment[]>('/payments'),
      api.get<Ticket[]>('/tickets'),
      api.get<Activity[]>('/activities'),
      api.get<EmailCampaign[]>('/campaigns'),
      api.get<PersonalGoal[]>('/goals'),
      api.get<ManagerTask[]>('/manager-tasks'),
      api.get<Requisition[]>('/requisitions'),
    ]);
    set({ users, leads, contacts, companies, projects, tasks, services, hostingAccounts, invoices, payments, tickets, activities, emailCampaigns, personalGoals, managerTasks, requisitions });
  },

  updateUser: async (id, updates) => {
    const updated = await api.patch<User>(`/users/${id}`, updates);
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? updated : u)),
      currentUser: s.currentUser.id === id ? updated : s.currentUser,
    }));
  },

  addStaff: async (staff) => {
    const res = await api.post<{ user: User }>('/auth/register', staff);
    set((s) => ({ users: [...s.users, res.user].sort((a, b) => a.name.localeCompare(b.name)) }));
  },

  addLead: async (lead) => {
    const created = await api.post<Lead>('/leads', lead);
    set((s) => ({ leads: [...s.leads, created] }));
  },
  updateLead: async (id, updates) => {
    const updated = await api.put<Lead>(`/leads/${id}`, updates);
    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? updated : l)) }));
  },
  deleteLead: async (id) => {
    await api.delete(`/leads/${id}`);
    set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
  },

  addContact: async (contact) => {
    const created = await api.post<Contact>('/contacts', contact);
    set((s) => ({ contacts: [...s.contacts, created] }));
  },
  updateContact: async (id, updates) => {
    const updated = await api.put<Contact>(`/contacts/${id}`, updates);
    set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? updated : c)) }));
  },
  deleteContact: async (id) => {
    await api.delete(`/contacts/${id}`);
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) }));
  },

  addCompany: async (company) => {
    const created = await api.post<Company>('/companies', company);
    set((s) => ({ companies: [...s.companies, created] }));
  },
  updateCompany: async (id, updates) => {
    const updated = await api.put<Company>(`/companies/${id}`, updates);
    set((s) => ({ companies: s.companies.map((c) => (c.id === id ? updated : c)) }));
  },
  deleteCompany: async (id) => {
    await api.delete(`/companies/${id}`);
    set((s) => ({ companies: s.companies.filter((c) => c.id !== id) }));
  },

  addProject: async (project) => {
    const created = await api.post<Project>('/projects', project);
    set((s) => ({ projects: [...s.projects, created] }));
  },
  updateProject: async (id, updates) => {
    const updated = await api.put<Project>(`/projects/${id}`, updates);
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? updated : p)) }));
  },
  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
  },

  addTask: async (task) => {
    const created = await api.post<Task>('/tasks', task);
    set((s) => ({ tasks: [...s.tasks, created] }));
  },
  updateTask: async (id, updates) => {
    const updated = await api.put<Task>(`/tasks/${id}`, updates);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
  },
  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  addService: async (service) => {
    const created = await api.post<Service>('/services', service);
    set((s) => ({ services: [...s.services, created] }));
  },
  updateService: async (id, updates) => {
    const updated = await api.put<Service>(`/services/${id}`, updates);
    set((s) => ({ services: s.services.map((sv) => (sv.id === id ? updated : sv)) }));
  },
  deleteService: async (id) => {
    await api.delete(`/services/${id}`);
    set((s) => ({ services: s.services.filter((sv) => sv.id !== id) }));
  },

  addHostingAccount: async (account) => {
    const created = await api.post<HostingAccount>('/hosting', account);
    set((s) => ({ hostingAccounts: [...s.hostingAccounts, created] }));
  },
  updateHostingAccount: async (id, updates) => {
    const updated = await api.put<HostingAccount>(`/hosting/${id}`, updates);
    set((s) => ({ hostingAccounts: s.hostingAccounts.map((h) => (h.id === id ? updated : h)) }));
  },
  deleteHostingAccount: async (id) => {
    await api.delete(`/hosting/${id}`);
    set((s) => ({ hostingAccounts: s.hostingAccounts.filter((h) => h.id !== id) }));
  },

  addInvoice: async (invoice) => {
    const created = await api.post<Invoice>('/invoices', invoice);
    set((s) => ({ invoices: [...s.invoices, created] }));
  },
  updateInvoice: async (id, updates) => {
    const updated = await api.put<Invoice>(`/invoices/${id}`, updates);
    set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? updated : i)) }));
  },
  deleteInvoice: async (id) => {
    await api.delete(`/invoices/${id}`);
    set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) }));
  },

  addPayment: async (payment) => {
    const created = await api.post<Payment>('/payments', payment);
    set((s) => {
      const invoice = s.invoices.find((i) => i.id === payment.invoiceId);
      if (!invoice) return { payments: [...s.payments, created] };
      const newAmountPaid = invoice.amountPaid + created.amount;
      const newStatus = newAmountPaid >= invoice.total ? 'paid' : 'partially-paid';
      return {
        payments: [...s.payments, created],
        invoices: s.invoices.map((i) =>
          i.id === payment.invoiceId ? { ...i, amountPaid: newAmountPaid, status: newStatus as Invoice['status'] } : i
        ),
      };
    });
  },

  addTicket: async (ticket) => {
    const created = await api.post<Ticket>('/tickets', ticket);
    set((s) => ({ tickets: [...s.tickets, created] }));
  },
  updateTicket: async (id, updates) => {
    const updated = await api.put<Ticket>(`/tickets/${id}`, updates);
    set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? updated : t)) }));
  },
  deleteTicket: async (id) => {
    await api.delete(`/tickets/${id}`);
    set((s) => ({ tickets: s.tickets.filter((t) => t.id !== id) }));
  },

  addActivity: async (activity) => {
    const created = await api.post<Activity>('/activities', activity);
    set((s) => ({ activities: [created, ...s.activities] }));
  },

  addEmailCampaign: async (campaign) => {
    const created = await api.post<EmailCampaign>('/campaigns', campaign);
    set((s) => ({ emailCampaigns: [...s.emailCampaigns, created] }));
  },
  updateEmailCampaign: async (id, updates) => {
    const updated = await api.put<EmailCampaign>(`/campaigns/${id}`, updates);
    set((s) => ({ emailCampaigns: s.emailCampaigns.map((e) => (e.id === id ? updated : e)) }));
  },
  deleteEmailCampaign: async (id) => {
    await api.delete(`/campaigns/${id}`);
    set((s) => ({ emailCampaigns: s.emailCampaigns.filter((e) => e.id !== id) }));
  },

  addPersonalGoal: async (goal) => {
    const created = await api.post<PersonalGoal>('/goals', goal);
    set((s) => ({ personalGoals: [created, ...s.personalGoals] }));
  },
  updatePersonalGoal: async (id, updates) => {
    const updated = await api.put<PersonalGoal>(`/goals/${id}`, updates);
    set((s) => ({ personalGoals: s.personalGoals.map((g) => (g.id === id ? updated : g)) }));
  },
  deletePersonalGoal: async (id) => {
    await api.delete(`/goals/${id}`);
    set((s) => ({ personalGoals: s.personalGoals.filter((g) => g.id !== id) }));
  },

  addManagerTask: async (task) => {
    const created = await api.post<ManagerTask>('/manager-tasks', task);
    set((s) => ({ managerTasks: [created, ...s.managerTasks] }));
  },
  updateManagerTask: async (id, updates) => {
    const updated = await api.put<ManagerTask>(`/manager-tasks/${id}`, updates);
    set((s) => ({ managerTasks: s.managerTasks.map((t) => (t.id === id ? updated : t)) }));
  },
  deleteManagerTask: async (id) => {
    await api.delete(`/manager-tasks/${id}`);
    set((s) => ({ managerTasks: s.managerTasks.filter((t) => t.id !== id) }));
  },

  addRequisition: async (reqPayload) => {
    const created = await api.post<Requisition>('/requisitions', reqPayload);
    set((s) => ({ requisitions: [created, ...s.requisitions] }));
  },
  approveRequisition: async (id) => {
    const updated = await api.patch<Requisition>(`/requisitions/${id}/approve`);
    set((s) => ({ requisitions: s.requisitions.map((r) => (r.id === id ? updated : r)) }));
  },
  rejectRequisition: async (id) => {
    const updated = await api.patch<Requisition>(`/requisitions/${id}/reject`);
    set((s) => ({ requisitions: s.requisitions.map((r) => (r.id === id ? updated : r)) }));
  },
  deleteRequisition: async (id) => {
    await api.delete(`/requisitions/${id}`);
    set((s) => ({ requisitions: s.requisitions.filter((r) => r.id !== id) }));
  },
}));

setUnauthorizedHandler(() => useStore.getState().logout());
