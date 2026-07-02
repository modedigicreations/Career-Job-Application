export type Currency = 'NGN' | 'GBP' | 'USD';

export type LeadSource = 'website' | 'facebook-ads' | 'google-ads' | 'whatsapp' | 'manual' | 'csv-import' | 'referral';

export type LeadStatus = 'new-lead' | 'qualified' | 'contacted' | 'discovery-call' | 'proposal-sent' | 'negotiation' | 'won' | 'lost';

export type ServiceType =
  | 'website-development'
  | 'ecommerce-development'
  | 'lms-development'
  | 'custom-software'
  | 'seo-services'
  | 'web-hosting'
  | 'domain-registration'
  | 'graphic-design'
  | 'social-media-management'
  | 'cbt-platform';

export type ProjectStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially-paid' | 'overdue' | 'cancelled';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export type HostingPlan = 'starter' | 'business' | 'enterprise' | 'custom';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'support' | 'developer';
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  serviceInterested: ServiceType;
  source: LeadSource;
  budget: number;
  currency: Currency;
  notes: string;
  status: LeadStatus;
  estimatedValue: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  /** Client-side only convenience list; the server derives contacts by company name. */
  contactIds?: string[];
  createdAt: string;
}

export interface Deal {
  id: string;
  leadId: string;
  title: string;
  value: number;
  currency: Currency;
  stage: LeadStatus;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  contactId: string;
  companyId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  /** Optional link to a contact record; projects are keyed by clientName on the server. */
  clientId?: string;
  clientName: string;
  serviceType: ServiceType;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  currency: Currency;
  progress: number;
  assignedTeam: string[];
  dealId?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  order: number;
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
}

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  basePrice: number;
  currency: Currency;
  isActive: boolean;
  features: string[];
}

export interface HostingAccount {
  id: string;
  clientId: string;
  clientName: string;
  domainName: string;
  registrationDate: string;
  expiryDate: string;
  hostingPlan: HostingPlan;
  sslStatus: 'active' | 'expired' | 'none';
  autoRenew: boolean;
  status: 'active' | 'suspended' | 'expired';
  monthlyFee: number;
  currency: Currency;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  projectId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  currency: Currency;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: Currency;
  method: 'bank-transfer' | 'card' | 'cash' | 'paystack' | 'flutterwave';
  reference: string;
  date: string;
  notes: string;
}

export interface Ticket {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal-update' | 'lead-created' | 'invoice-sent';
  description: string;
  entityType: 'lead' | 'contact' | 'deal' | 'project' | 'invoice' | 'ticket';
  entityId: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  type: 'lead-nurture' | 'hosting-renewal' | 'custom';
  status: 'draft' | 'active' | 'paused' | 'completed';
  recipientCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
}

export interface StaffPerformance {
  userId: string;
  userName: string;
  leadsGenerated: number;
  callsMade: number;
  emailsSent: number;
  dealsWon: number;
  revenueGenerated: number;
  projectsCompleted: number;
  period: string;
}
