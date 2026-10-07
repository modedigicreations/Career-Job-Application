export type Currency = 'NGN' | 'GBP' | 'USD';

export type UserRole = 
  | 'super_admin'
  | 'managing_director'
  | 'manager'
  | 'employee'
  | 'admin'
  | 'sales'
  | 'support'
  | 'developer'
  | 'accounts'
  | 'administration';

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  manager_id?: string | null;
  department?: string;
  job_title?: string;
  phone?: string;
  avatar_url?: string;
  is_active?: boolean;
  hasPayrollAccess?: boolean;
  hourly_rate?: number;
  currency?: Currency;
  created_at?: string;
  last_login?: string;
}

export interface StaffShift {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  department: string;
  jobTitle: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // ISO string
  clockOutTime?: string | null; // ISO string
  durationHours: number;
  status: 'active' | 'completed';
  notes?: string;
  hourlyRate?: number;
  tasksPlannedCount?: number;
  tasksCompletedCount?: number;
  tasksCarriedForwardCount?: number;
  shiftReviewNotes?: string;
}

export interface ShiftTask {
  id: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  title: string;
  priority: TaskPriority;
  status: 'pending' | 'completed';
  completedAt?: string;
  carriedForwardFrom?: string; // YYYY-MM-DD if carried over from previous day
  projectId?: string;
  projectName?: string;
  notes?: string;
  createdAt: string;
}

// ==========================================
// CRM TYPES
// ==========================================
export type LeadSource = 
  | 'website'
  | 'facebook-ads'
  | 'google-ads'
  | 'whatsapp'
  | 'manual'
  | 'csv-import'
  | 'referral';

export type LeadStatus = 
  | 'new-lead'
  | 'qualified'
  | 'contacted'
  | 'discovery-call'
  | 'proposal-sent'
  | 'negotiation'
  | 'won'
  | 'lost';

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
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  name: string;
  company: string;
  companyId?: string;
  contactId?: string;
  email: string;
  phone: string;
  serviceInterested: ServiceType;
  source: LeadSource;
  budget: number;
  currency: Currency;
  notes: string;
  designation?: string;
  address?: string;
  status: LeadStatus;
  estimatedValue: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  companyId?: string;
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
  contactIds?: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  clientId?: string;
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
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate: string;
  order: number;
  createdAt: string;
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
  clientName: string;
  clientId?: string;
  domainName: string;
  registrationDate: string;
  expiryDate: string;
  hostingPlan: 'starter' | 'business' | 'enterprise' | 'custom';
  sslStatus: 'active' | 'expired' | 'none' | 'pending';
  autoRenew: boolean;
  status: 'active' | 'suspended' | 'expired';
  monthlyFee: number;
  currency: Currency;
  isWhmcsLive?: boolean;
  whmcsDomainId?: string | number;
  registrar?: string;
}

export interface WhmcsConfig {
  apiUrl: string;
  identifier: string;
  secret: string;
  autoSync: boolean;
  isConnected: boolean;
  lastSyncAt?: string;
  totalLiveDomains?: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientId?: string;
  projectId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  currency: Currency;
  status: 'draft' | 'sent' | 'paid' | 'partially-paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  notes?: string;
  logoUrl?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: Currency;
  method: 'bank-transfer' | 'paystack' | 'flutterwave' | 'stripe' | 'cash' | 'other';
  reference?: string;
  notes?: string;
  date: string;
}

export type TicketSource = 'whmcs' | 'contact_email' | 'billing_email' | 'portal' | 'manual';

export interface Ticket {
  id: string;
  ticketNumber?: string;
  clientName: string;
  clientId?: string;
  clientEmail?: string;
  department?: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedStaffName?: string;
  sourceChannel?: TicketSource;
  whmcsTicketId?: string | number;
  lastReplyBy?: string;
  lastReplyAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// OFFICE EXPENSE TYPES
// ==========================================
export type RequisitionUrgency = 'Low' | 'Medium' | 'High' | 'Urgent';
export type RequisitionStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';

export interface Requisition {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: Currency;
  category: string;
  urgency: RequisitionUrgency;
  status: RequisitionStatus;
  staffName: string;
  staffId?: string;
  receiptNumber: string;
  decisionNotes?: string;
  decidedAt?: string;
  decidedBy?: string;
  completedAt?: string;
  disbursedBy?: string;
  transactionId?: string;
  createdAt: string;
}

// ==========================================
// ONE-MINUTE MANAGER TYPES
// ==========================================
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'behind';
export type StrategyStatus = 'pending_submission' | 'submitted' | 'approved' | 'revision_requested';

export interface Goal {
  id: string;
  manager_id: string;
  employee_id: string;
  objective: string;
  expected_result: string;
  deadline: string;
  progress: number;
  status: GoalStatus;
  strategy_status: StrategyStatus;
  strategy_text?: string;
  strategy_feedback?: string;
  strategy_submitted_at?: string;
  strategy_approved_at?: string;
  created_at: string;
  employee_name?: string;
  manager_name?: string;
}

export interface StrategyIteration {
  id: string;
  goal_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  action_type: 'submitted' | 'revision_requested' | 'approved' | 'co_edited';
  strategy_content: string;
  feedback_note?: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  goal_id?: string;
  manager_id: string;
  manager_name: string;
  employee_id: string;
  employee_name: string;
  type: 'praise' | 'redirect';
  details: string;
  viewed_at?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link_url?: string;
  read: boolean;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  entity_type: string;
  entity_id: string;
  user_name: string;
  created_at: string;
}

// ==========================================
// PAYROLL TYPES
// ==========================================
export type PayrollStatus = 'draft' | 'pending_approval' | 'approved' | 'paid';

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  department: string;
  jobTitle: string;
  period: string; // e.g. "October 2026"
  payDate: string;
  currency: Currency;
  baseSalary: number;
  allowances: {
    housing?: number;
    transport?: number;
    utility?: number;
    medical?: number;
    other?: number;
  };
  bonuses: number;
  shiftHours?: number;
  shiftHourlyRate?: number;
  grossPay: number;
  deductions: {
    tax?: number; // PAYE
    pension?: number;
    healthInsurance?: number;
    loan?: number;
    other?: number;
  };
  totalDeductions: number;
  netPay: number;
  paymentMethod: 'bank_transfer' | 'cash' | 'check';
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  status: PayrollStatus;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

// ==========================================
// INTERNAL MEMOS & EXECUTIVE ANNOUNCEMENTS
// ==========================================
export type MemoPriority = 'normal' | 'urgent' | 'announcement' | 'policy';
export type MemoTargetAudience = 'all' | 'department' | 'specific_staff';
export type MemoCategory = 'general' | 'policy' | 'operations' | 'urgent_notice' | 'event';

export interface StaffMemo {
  id: string;
  memoNumber: string;
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  senderDepartment?: string;
  targetAudience: MemoTargetAudience;
  targetDepartment?: string;
  targetStaffIds?: string[];
  priority: MemoPriority;
  category: MemoCategory;
  requiresAcknowledgment?: boolean;
  readBy: { [staffId: string]: string }; // staffId -> ISO timestamp
  acknowledgedBy: { [staffId: string]: string }; // staffId -> ISO timestamp
  createdAt: string;
  updatedAt?: string;
}
