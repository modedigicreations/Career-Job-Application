import type {
  UserProfile, Lead, Contact, Company, Project, Task, Service, HostingAccount,
  Invoice, Payment, Ticket, ActivityItem, Requisition, Goal, Feedback, AppNotification,
  PayrollRecord, StaffShift, StaffMemo, ShiftTask
} from './types';

export const initialProfiles: UserProfile[] = [
  { id: 'u1', email: 'info@modedigitalcreations.ng', password: 'Solutions1@1@', full_name: 'Davids Ogan', role: 'managing_director', department: 'Executive', job_title: 'Managing Director & Super Admin', phone: '+234 801 234 5678', is_active: true, hasPayrollAccess: true },
  { id: 'u2', email: 'chioma@modedigitalcreations.ng', password: 'MDCLPH1@1@', full_name: 'Chioma Eze', role: 'sales', department: 'Sales & Growth', job_title: 'Head of Sales', phone: '+234 802 345 6789', is_active: true },
  { id: 'u3', email: 'emeka@modedigitalcreations.ng', password: 'MDCLPH1@1@', full_name: 'Emeka Nwosu', role: 'developer', department: 'Engineering', job_title: 'Senior Full-Stack Engineer', phone: '+234 803 456 7890', is_active: true },
  { id: 'u4', email: 'fatima@modedigitalcreations.ng', password: 'MDCLPH1@1@', full_name: 'Fatima Bello', role: 'manager', department: 'Operations', job_title: 'Operations & Project Manager', phone: '+234 804 567 8901', is_active: true },
  { id: 'u5', email: 'ibrahim@modedigitalcreations.ng', password: 'MDCLPH1@1@', full_name: 'Ibrahim Musa', role: 'administration', department: 'Administration', job_title: 'Administration & Finance Lead', phone: '+234 805 678 9012', is_active: true, hasPayrollAccess: true },
  { id: 'u6', email: 'admin@modewebhost.com.ng', password: 'MDCLPH1@1@', full_name: 'Mode Web Host Admin', role: 'managing_director', department: 'Executive & Systems', job_title: 'Super Admin & Lead Hostmaster', phone: '+234 801 888 9999', is_active: true, hasPayrollAccess: true },
  { id: 'u7', email: 'ben@modewebhost.com.ng', password: 'MDCLPH1@1@', full_name: 'Ben Asiedu', role: 'employee', department: 'Web Hosting & Support', job_title: 'Hosting & Technical Support Specialist', phone: '+234 802 888 7777', is_active: true, hasPayrollAccess: false },
];

export const initialLeads: Lead[] = [];

export const initialContacts: Contact[] = [];
export const initialCompanies: Company[] = [];
export const initialProjects: Project[] = [];
export const initialTasks: Task[] = [];

export const initialShiftTasks: ShiftTask[] = [];

export const initialServices: Service[] = [
  { id: 's1', name: 'Custom Website Development', type: 'website-development', description: 'Enterprise responsive web applications built with Next.js & Tailwind', basePrice: 650000, currency: 'NGN', isActive: true, features: ['Next.js Architecture', 'High Performance Core Web Vitals', 'CMS Integration', 'Enterprise SEO', 'Analytics & Tag Manager'] },
  { id: 's2', name: 'E-commerce Platforms', type: 'ecommerce-development', description: 'High-converting online storefronts with payment gateway integrations', basePrice: 1800000, currency: 'NGN', isActive: true, features: ['Product Catalog', 'Paystack / Flutterwave', 'Inventory Management', 'Order Tracking', 'Customer Portal'] },
  { id: 's3', name: 'Learning Management System (LMS)', type: 'lms-development', description: 'Scalable educational platforms with student and instructor dashboards', basePrice: 3500000, currency: 'NGN', isActive: true, features: ['Course Builder', 'Student Progress', 'Video Hosting', 'Automated Certification', 'Assignment Grading'] },
  { id: 's4', name: 'ModeCBT Examination Platform', type: 'cbt-platform', description: 'Ultra-reliable Computer-Based Testing platform for institutions', basePrice: 2500000, currency: 'NGN', isActive: true, features: ['Timed Exams', 'Randomized Questions', 'Offline-Resilient Architecture', 'Real-time Analytics', 'Tamper Resistance'] },
  { id: 's5', name: 'Managed Cloud Web Hosting', type: 'web-hosting', description: 'High-availability SSD hosting with daily automated backups and SSL', basePrice: 35000, currency: 'NGN', isActive: true, features: ['99.9% Uptime SLA', 'Free SSL Certificates', 'Automated Daily Backups', '24/7 Monitoring', 'cPanel & SSH Access'] },
  { id: 's6', name: 'Custom Software & APIs', type: 'custom-software', description: 'Tailored enterprise software, CRM, and cloud backend microservices', basePrice: 6000000, currency: 'NGN', isActive: true, features: ['System Architecture', 'Supabase / PostgreSQL', 'Secure REST & GraphQL APIs', 'Automated Tests', 'Cloud Deployment'] },
  { id: 's7', name: 'MODE Schools', type: 'custom-software', description: 'All-in-one School Management ERP with Student Information System, fee invoicing, and grade books', basePrice: 1500000, currency: 'NGN', isActive: true, features: ['Student Information System (SIS)', 'Termly Report Card Generator', 'Online Fee Payment & Receipts', 'Attendance & Staff Roster Tracking', 'Parent Portal & SMS Alerts', 'ModeCBT Platform Integration'] },
  { id: 's8', name: 'Domain Registration (.com)', type: 'domain-registration', description: 'Global commercial domain name registration with automated DNS management and free WHOIS privacy', basePrice: 25000, currency: 'NGN', isActive: true, features: ['Instant Automated Activation', 'Free DNS Management Zone', 'WHOIS Privacy Protection', 'Domain & Email Forwarding', '2FA Domain Lock Security'] },
  { id: 's9', name: 'Domain Registration (.ng)', type: 'domain-registration', description: 'Official Nigerian national ccTLD domain with accredited NiRA registry routing and high local SEO ranking', basePrice: 18000, currency: 'NGN', isActive: true, features: ['Official NiRA Registry Accreditation', 'Instant DNS Propagation', 'Premium Nigerian Brand Identity', 'Anycast Nameserver Network', 'Seamless Hosting Linking'] },
  { id: 's10', name: 'Domain Registration (.com.ng)', type: 'domain-registration', description: 'Cost-effective Nigerian business domain registration with complete DNS control and automated renewal', basePrice: 8500, currency: 'NGN', isActive: true, features: ['Affordable Local Business Identity', 'Instant Registry Verification', 'Free DNS & Zone Management', 'Email Forwarding Aliases', '1-Click WHMCS Provisioning'] },
  { id: 's11', name: 'CPanel Unlimited Hosting', type: 'web-hosting', description: 'Unlimited cPanel cloud hosting with unmetered NVMe SSD storage, unlimited databases, and corporate email accounts', basePrice: 65000, currency: 'NGN', isActive: true, features: ['Unmetered NVMe SSD Storage', 'Unlimited Business Email Accounts', 'Free AutoSSL Security Certificates', 'Unlimited MySQL Databases', '1-Click Softaculous App Installer', 'Daily Automated Remote Backups'] },
];

export const initialHostingAccounts: HostingAccount[] = [];
export const initialInvoices: Invoice[] = [];
export const initialPayments: Payment[] = [];
export const initialRequisitions: Requisition[] = [];
export const initialGoals: Goal[] = [];
export const initialFeedbacks: Feedback[] = [];
export const initialTickets: Ticket[] = [];
export const initialActivities: ActivityItem[] = [];
export const initialNotifications: AppNotification[] = [];
export const initialPayrollRecords: PayrollRecord[] = [];
export const initialShifts: StaffShift[] = [];

export const initialMemos: StaffMemo[] = [
  {
    id: 'memo-001',
    memoNumber: 'MEMO-2026-001',
    title: 'URGENT: Public Holiday Office Schedule & Emergency Standby Rotations',
    content: `All Team Members,\n\nPlease be informed of our operational schedule for the upcoming public holiday. While physical operations will observe the national holiday, the Web Hosting Infrastructure and Client Support desk will maintain active on-call coverage to guarantee 99.9% uptime for all client portals and WHMCS provisioning.\n\nKey Directives:\n1. Technical Support & Systems Specialists (Ben Asiedu & Emeka Nwosu) will monitor automated server health alerts on rotating shifts.\n2. Any emergency client escalations received via WhatsApp or support ticket must be responded to within 30 minutes.\n3. Daily shift clock-in remains mandatory for staff working remote standby.\n\nPlease read and acknowledge this memo below immediately.`,
    senderId: 'u1',
    senderName: 'Davids Ogan',
    senderRole: 'managing_director',
    senderDepartment: 'Executive',
    targetAudience: 'all',
    priority: 'urgent',
    category: 'urgent_notice',
    requiresAcknowledgment: true,
    readBy: {
      'u1': '2026-09-30T08:00:00Z',
      'u4': '2026-09-30T09:15:00Z',
      'u5': '2026-09-30T10:00:00Z'
    },
    acknowledgedBy: {
      'u1': '2026-09-30T08:00:00Z',
      'u4': '2026-09-30T09:20:00Z'
    },
    createdAt: '2026-09-30T07:45:00Z'
  },
  {
    id: 'memo-002',
    memoNumber: 'MEMO-2026-002',
    title: 'Standard Operating Procedures for Client Hosting & Server Deployments',
    content: `Attention All Engineering & Hosting Staff,\n\nEffective immediately, the following protocol must be strictly observed prior to deploying updates or provisioning live hosting accounts for corporate clients:\n\n1. Staging Verification: All website and web application code must undergo end-to-end testing in the local/staging environment before pushing to client production servers.\n2. WHMCS Synchronization: Domain registrations, SSL certificate certificates, and monthly renewals must be reconciled via the MODE Ops WHMCS live API integration.\n3. Zero Unscheduled Downtime: Maintenance windows must be announced to clients with at least 48 hours prior notification.\n\nManagement expects strict compliance from all technical personnel.`,
    senderId: 'u4',
    senderName: 'Fatima Bello',
    senderRole: 'manager',
    senderDepartment: 'Operations',
    targetAudience: 'all',
    priority: 'policy',
    category: 'policy',
    requiresAcknowledgment: true,
    readBy: {
      'u1': '2026-09-28T11:00:00Z',
      'u3': '2026-09-28T14:30:00Z',
      'u7': '2026-09-28T16:00:00Z'
    },
    acknowledgedBy: {
      'u1': '2026-09-28T11:05:00Z',
      'u3': '2026-09-28T14:45:00Z'
    },
    createdAt: '2026-09-28T10:00:00Z'
  },
  {
    id: 'memo-003',
    memoNumber: 'MEMO-2026-003',
    title: 'Q4 2026 Operations & Client Deliverables Strategic Alignment',
    content: `Dear Team,\n\nAs we enter the final quarter of 2026, I want to commend the entire MODE Digital Creations & Mode Web Host team for our stellar client delivery and expanded sales pipeline.\n\nOur top priorities for Q4:\n• Accelerate close rate on active corporate proposals (TechVenture, Sahara Logistics, EduFirst).\n• Maintain strict adherence to daily shift attendance logging; verified shift hours directly feed into your monthly payroll disbursement.\n• Ensure prompt processing of office expense requisitions with valid vendor receipts.\n\nManagement has instituted end-of-year performance bonuses tied to goal completions logged through our One-Minute Leadership framework. Let us stay focused and close the year with excellence!`,
    senderId: 'u1',
    senderName: 'Davids Ogan',
    senderRole: 'managing_director',
    senderDepartment: 'Executive',
    targetAudience: 'all',
    priority: 'announcement',
    category: 'operations',
    requiresAcknowledgment: false,
    readBy: {
      'u1': '2026-09-25T09:00:00Z',
      'u2': '2026-09-25T11:20:00Z',
      'u3': '2026-09-25T12:00:00Z',
      'u4': '2026-09-25T13:40:00Z'
    },
    acknowledgedBy: {
      'u1': '2026-09-25T09:00:00Z',
      'u2': '2026-09-25T11:25:00Z'
    },
    createdAt: '2026-09-25T08:30:00Z'
  }
];

