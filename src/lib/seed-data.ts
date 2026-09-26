import type {
  UserProfile, Lead, Contact, Company, Project, Task, Service, HostingAccount,
  Invoice, Payment, Ticket, ActivityItem, Requisition, Goal, Feedback, AppNotification
} from './types';

export const initialProfiles: UserProfile[] = [
  { id: 'u1', email: 'davids@modedigital.ng', full_name: 'Davids Ogan', role: 'managing_director', department: 'Executive', job_title: 'Managing Director & Founder', phone: '+234 801 234 5678', is_active: true },
  { id: 'u2', email: 'chioma@modedigital.ng', full_name: 'Chioma Eze', role: 'sales', department: 'Sales & Growth', job_title: 'Head of Sales', phone: '+234 802 345 6789', is_active: true },
  { id: 'u3', email: 'emeka@modedigital.ng', full_name: 'Emeka Nwosu', role: 'developer', department: 'Engineering', job_title: 'Senior Full-Stack Engineer', phone: '+234 803 456 7890', is_active: true },
  { id: 'u4', email: 'fatima@modedigital.ng', full_name: 'Fatima Bello', role: 'manager', department: 'Operations', job_title: 'Operations & Project Manager', phone: '+234 804 567 8901', is_active: true },
  { id: 'u5', email: 'ibrahim@modedigital.ng', full_name: 'Ibrahim Musa', role: 'accounts', department: 'Finance & Support', job_title: 'Finance & Client Support Lead', phone: '+234 805 678 9012', is_active: true },
];

export const initialLeads: Lead[] = [
  { id: 'l1', name: 'Chukwudi Abiola', company: 'TechVenture Nigeria', email: 'chukwudi@techventure.ng', phone: '+234 810 111 2222', serviceInterested: 'website-development', source: 'website', budget: 1500000, currency: 'NGN', notes: 'Interested in a corporate portal with CMS', status: 'new-lead', estimatedValue: 1500000, probability: 20, expectedCloseDate: '2026-10-15', assignedTo: 'u2', createdAt: '2026-06-01' },
  { id: 'l2', name: 'Amina Yusuf', company: 'Sahara Logistics', email: 'amina@saharalog.com', phone: '+234 811 222 3333', serviceInterested: 'ecommerce-development', source: 'facebook-ads', budget: 3200000, currency: 'NGN', notes: 'Needs e-commerce logistics supplies checkout', status: 'qualified', estimatedValue: 3200000, probability: 40, expectedCloseDate: '2026-10-30', assignedTo: 'u2', createdAt: '2026-05-20' },
  { id: 'l3', name: 'Olufemi Peters', company: 'EduFirst Academy', email: 'olufemi@edufirst.ng', phone: '+234 812 333 4444', serviceInterested: 'lms-development', source: 'google-ads', budget: 5500000, currency: 'NGN', notes: 'LMS for 650+ students with ModeCBT integration', status: 'discovery-call', estimatedValue: 5500000, probability: 60, expectedCloseDate: '2026-10-15', assignedTo: 'u4', createdAt: '2026-05-10' },
  { id: 'l4', name: 'Grace Obi', company: 'HealthPlus Clinics', email: 'grace@healthplus.ng', phone: '+234 813 444 5555', serviceInterested: 'custom-software', source: 'referral', budget: 8500000, currency: 'NGN', notes: 'Clinic management system with patient portal', status: 'proposal-sent', estimatedValue: 8500000, probability: 70, expectedCloseDate: '2026-10-01', assignedTo: 'u4', createdAt: '2026-04-25' },
  { id: 'l5', name: 'David Thompson', company: 'UK Trade Connect', email: 'david@uktrade.co.uk', phone: '+44 20 7946 0958', serviceInterested: 'website-development', source: 'website', budget: 5200, currency: 'GBP', notes: 'UK-based corporate site for West Africa operations', status: 'negotiation', estimatedValue: 5200, probability: 85, expectedCloseDate: '2026-09-30', assignedTo: 'u2', createdAt: '2026-04-10' },
  { id: 'l6', name: 'Ngozi Kalu', company: 'FashionHub Lagos', email: 'ngozi@fashionhub.ng', phone: '+234 814 555 6666', serviceInterested: 'ecommerce-development', source: 'whatsapp', budget: 2200000, currency: 'NGN', notes: 'Online fashion boutique with payment & delivery integration', status: 'won', estimatedValue: 2200000, probability: 100, expectedCloseDate: '2026-06-01', assignedTo: 'u2', createdAt: '2026-03-15' },
  { id: 'l7', name: 'Tunde Bakare', company: 'AgriTech Solutions', email: 'tunde@agritech.ng', phone: '+234 815 666 7777', serviceInterested: 'seo-services', source: 'manual', budget: 650000, currency: 'NGN', notes: 'SEO and content marketing for agro-exports', status: 'contacted', estimatedValue: 650000, probability: 35, expectedCloseDate: '2026-10-01', assignedTo: 'u2', createdAt: '2026-06-10' },
  { id: 'l8', name: 'John Smith', company: 'Global Ventures LLC', email: 'john@globalventures.com', phone: '+1 212 555 0199', serviceInterested: 'web-hosting', source: 'google-ads', budget: 2800, currency: 'USD', notes: 'Dedicated cloud hosting cluster for 12 websites', status: 'new-lead', estimatedValue: 2800, probability: 20, expectedCloseDate: '2026-11-01', assignedTo: 'u2', createdAt: '2026-06-20' },
];

export const initialContacts: Contact[] = [
  { id: 'c1', name: 'Chukwudi Abiola', email: 'chukwudi@techventure.ng', phone: '+234 810 111 2222', company: 'TechVenture Nigeria', position: 'CEO & Founder', notes: 'Prefers WhatsApp updates on weekdays', isActive: true, createdAt: '2026-06-01' },
  { id: 'c2', name: 'Amina Yusuf', email: 'amina@saharalog.com', phone: '+234 811 222 3333', company: 'Sahara Logistics', position: 'VP Operations', notes: 'Requested demo of freight tracking', isActive: true, createdAt: '2026-05-20' },
  { id: 'c3', name: 'Olufemi Peters', email: 'olufemi@edufirst.ng', phone: '+234 812 333 4444', company: 'EduFirst Academy', position: 'Principal Administrator', notes: 'Needs exam schedule ready before term resumes', isActive: true, createdAt: '2026-05-10' },
  { id: 'c4', name: 'Grace Obi', email: 'grace@healthplus.ng', phone: '+234 813 444 5555', company: 'HealthPlus Clinics', position: 'Medical Director', notes: 'Strict HIPAA and NDPR compliance requirements', isActive: true, createdAt: '2026-04-25' },
  { id: 'c5', name: 'Ngozi Kalu', email: 'ngozi@fashionhub.ng', phone: '+234 814 555 6666', company: 'FashionHub Lagos', position: 'Creative Director', notes: 'Active client, fast turnaround expected', isActive: true, createdAt: '2026-03-15' },
  { id: 'c6', name: 'David Thompson', email: 'david@uktrade.co.uk', phone: '+44 20 7946 0958', company: 'UK Trade Connect', position: 'Head of West Africa Desk', notes: 'Requires GBP invoicing and wire receipts', isActive: true, createdAt: '2026-04-10' },
];

export const initialCompanies: Company[] = [
  { id: 'co1', name: 'TechVenture Nigeria', industry: 'FinTech / SaaS', website: 'https://techventure.ng', email: 'info@techventure.ng', phone: '+234 810 111 2222', address: '15 Admiralty Way, Lekki Phase 1, Lagos', contactIds: ['c1'], createdAt: '2026-06-01' },
  { id: 'co2', name: 'Sahara Logistics', industry: 'Logistics & Supply Chain', website: 'https://saharalog.com', email: 'operations@saharalog.com', phone: '+234 811 222 3333', address: '42 Marina Road, Lagos Island, Lagos', contactIds: ['c2'], createdAt: '2026-05-20' },
  { id: 'co3', name: 'EduFirst Academy', industry: 'Education', website: 'https://edufirst.ng', email: 'admin@edufirst.ng', phone: '+234 812 333 4444', address: '8 University Crescent, Bodija, Ibadan, Oyo', contactIds: ['c3'], createdAt: '2026-05-10' },
  { id: 'co4', name: 'HealthPlus Clinics', industry: 'Healthcare', website: 'https://healthplus.ng', email: 'contact@healthplus.ng', phone: '+234 813 444 5555', address: '22 Awolowo Road, Ikoyi, Lagos', contactIds: ['c4'], createdAt: '2026-04-25' },
  { id: 'co5', name: 'FashionHub Lagos', industry: 'Retail & Fashion', website: 'https://fashionhub.ng', email: 'orders@fashionhub.ng', phone: '+234 814 555 6666', address: '5 Allen Avenue, Ikeja, Lagos', contactIds: ['c5'], createdAt: '2026-03-15' },
];

export const initialProjects: Project[] = [
  { id: 'p1', name: 'FashionHub E-commerce Store', description: 'Complete online store with Paystack, inventory sync, and dispatch API', clientName: 'Ngozi Kalu', clientId: 'c5', serviceType: 'ecommerce-development', status: 'in-progress', startDate: '2026-06-05', endDate: '2026-09-30', budget: 2200000, currency: 'NGN', progress: 45, assignedTeam: ['u3', 'u4'], dealId: 'l6', createdAt: '2026-06-05' },
  { id: 'p2', name: 'MODE Ops Suite Redesign', description: 'Consolidation of CRM, Expense Requisitions, and OMM into Next.js App Router', clientName: 'MODE Digital Internal', clientId: 'c1', serviceType: 'custom-software', status: 'in-progress', startDate: '2026-06-01', endDate: '2026-08-30', budget: 1500000, currency: 'NGN', progress: 75, assignedTeam: ['u1', 'u3'], createdAt: '2026-06-01' },
  { id: 'p3', name: 'EduFirst CBT Testing Center', description: 'Deploy and test high-concurrency exam software for 650 candidates', clientName: 'Olufemi Peters', clientId: 'c3', serviceType: 'cbt-platform', status: 'pending', startDate: '2026-09-01', endDate: '2026-10-30', budget: 3500000, currency: 'NGN', progress: 10, assignedTeam: ['u3', 'u4'], createdAt: '2026-06-18' },
];

export const initialTasks: Task[] = [
  { id: 't1', projectId: 'p1', title: 'Product schema & Paystack webhook setup', description: 'Configure order state transitions on webhook confirmation', status: 'completed', priority: 'high', assignedTo: 'u3', dueDate: '2026-06-25', order: 1, createdAt: '2026-06-05' },
  { id: 't2', projectId: 'p1', title: 'Mobile responsive checkout UI', description: 'Ensure seamless single-page checkout on mobile devices', status: 'in-progress', priority: 'urgent', assignedTo: 'u3', dueDate: '2026-07-10', order: 2, createdAt: '2026-06-05' },
  { id: 't3', projectId: 'p2', title: 'Merge 3 database schemas into unified Supabase', description: 'Migrate CRM, Office-Expense, and OMM tables with RLS', status: 'completed', priority: 'urgent', assignedTo: 'u3', dueDate: '2026-09-26', order: 1, createdAt: '2026-06-01' },
  { id: 't4', projectId: 'p2', title: 'Integrate Requisition approval flow', description: 'Staff submission -> Manager approval -> Accounts receipt', status: 'in-progress', priority: 'high', assignedTo: 'u3', dueDate: '2026-09-27', order: 2, createdAt: '2026-06-01' },
];

export const initialServices: Service[] = [
  { id: 's1', name: 'Custom Website Development', type: 'website-development', description: 'Enterprise responsive web applications built with Next.js & Tailwind', basePrice: 650000, currency: 'NGN', isActive: true, features: ['Next.js Architecture', 'High Performance Core Web Vitals', 'CMS Integration', 'Enterprise SEO', 'Analytics & Tag Manager'] },
  { id: 's2', name: 'E-commerce Platforms', type: 'ecommerce-development', description: 'High-converting online storefronts with payment gateway integrations', basePrice: 1800000, currency: 'NGN', isActive: true, features: ['Product Catalog', 'Paystack / Flutterwave', 'Inventory Management', 'Order Tracking', 'Customer Portal'] },
  { id: 's3', name: 'Learning Management System (LMS)', type: 'lms-development', description: 'Scalable educational platforms with student and instructor dashboards', basePrice: 3500000, currency: 'NGN', isActive: true, features: ['Course Builder', 'Student Progress', 'Video Hosting', 'Automated Certification', 'Assignment Grading'] },
  { id: 's4', name: 'ModeCBT Examination Platform', type: 'cbt-platform', description: 'Ultra-reliable Computer-Based Testing platform for institutions', basePrice: 2500000, currency: 'NGN', isActive: true, features: ['Timed Exams', 'Randomized Questions', 'Offline-Resilient Architecture', 'Real-time Analytics', 'Tamper Resistance'] },
  { id: 's5', name: 'Managed Cloud Web Hosting', type: 'web-hosting', description: 'High-availability SSD hosting with daily automated backups and SSL', basePrice: 35000, currency: 'NGN', isActive: true, features: ['99.9% Uptime SLA', 'Free SSL Certificates', 'Automated Daily Backups', '24/7 Monitoring', 'cPanel & SSH Access'] },
  { id: 's6', name: 'Custom Software & APIs', type: 'custom-software', description: 'Tailored enterprise software, CRM, and cloud backend microservices', basePrice: 6000000, currency: 'NGN', isActive: true, features: ['System Architecture', 'Supabase / PostgreSQL', 'Secure REST & GraphQL APIs', 'Automated Tests', 'Cloud Deployment'] },
];

export const initialHostingAccounts: HostingAccount[] = [
  { id: 'h1', clientName: 'FashionHub Lagos', clientId: 'c5', domainName: 'fashionhub.ng', registrationDate: '2025-06-01', expiryDate: '2027-06-01', hostingPlan: 'business', sslStatus: 'active', autoRenew: true, status: 'active', monthlyFee: 18000, currency: 'NGN' },
  { id: 'h2', clientName: 'TechVenture Nigeria', clientId: 'c1', domainName: 'techventure.ng', registrationDate: '2025-03-15', expiryDate: '2026-10-15', hostingPlan: 'enterprise', sslStatus: 'active', autoRenew: true, status: 'active', monthlyFee: 35000, currency: 'NGN' },
  { id: 'h3', clientName: 'EduFirst Academy', clientId: 'c3', domainName: 'edufirst.ng', registrationDate: '2025-01-10', expiryDate: '2026-10-05', hostingPlan: 'business', sslStatus: 'active', autoRenew: false, status: 'active', monthlyFee: 18000, currency: 'NGN' },
  { id: 'h4', clientName: 'HealthPlus Clinics', clientId: 'c4', domainName: 'healthplus.ng', registrationDate: '2024-08-20', expiryDate: '2026-11-20', hostingPlan: 'enterprise', sslStatus: 'active', autoRenew: true, status: 'active', monthlyFee: 35000, currency: 'NGN' },
  { id: 'h5', clientName: 'Sahara Logistics', clientId: 'c2', domainName: 'saharalog.com', registrationDate: '2025-11-05', expiryDate: '2026-12-05', hostingPlan: 'starter', sslStatus: 'active', autoRenew: true, status: 'active', monthlyFee: 10000, currency: 'NGN' },
];

export const initialInvoices: Invoice[] = [
  { id: 'inv1', invoiceNumber: 'INV-2026-001', clientName: 'FashionHub Lagos', clientEmail: 'ngozi@fashionhub.ng', clientId: 'c5', projectId: 'p1', items: [{ id: 'ii1', description: 'E-commerce Platform Architecture & UI', quantity: 1, unitPrice: 900000, total: 900000 }, { id: 'ii2', description: 'Payment & Logistics API Integration', quantity: 1, unitPrice: 300000, total: 300000 }], subtotal: 1200000, tax: 90000, total: 1290000, amountPaid: 1290000, currency: 'NGN', status: 'paid', issueDate: '2026-06-05', dueDate: '2026-06-20', notes: 'Phase 1 development invoice — settled in full via Bank Transfer.', createdAt: '2026-06-05' },
  { id: 'inv2', invoiceNumber: 'INV-2026-002', clientName: 'FashionHub Lagos', clientEmail: 'ngozi@fashionhub.ng', clientId: 'c5', projectId: 'p1', items: [{ id: 'ii3', description: 'E-commerce Milestone 2: Final QA & Launch', quantity: 1, unitPrice: 910000, total: 910000 }], subtotal: 910000, tax: 68250, total: 978250, amountPaid: 0, currency: 'NGN', status: 'sent', issueDate: '2026-06-20', dueDate: '2026-07-15', notes: 'Milestone 2 final invoice.', createdAt: '2026-06-20' },
  { id: 'inv3', invoiceNumber: 'INV-2026-003', clientName: 'TechVenture Nigeria', clientEmail: 'chukwudi@techventure.ng', clientId: 'c1', items: [{ id: 'ii4', description: 'Annual Dedicated Cloud Hosting - Enterprise', quantity: 12, unitPrice: 35000, total: 420000 }], subtotal: 420000, tax: 31500, total: 451500, amountPaid: 451500, currency: 'NGN', status: 'paid', issueDate: '2026-03-15', dueDate: '2026-04-15', notes: 'Annual hosting cluster renewal.', createdAt: '2026-03-15' },
  { id: 'inv4', invoiceNumber: 'INV-2026-004', clientName: 'UK Trade Connect', clientEmail: 'david@uktrade.co.uk', clientId: 'c6', items: [{ id: 'ii5', description: 'International Trade Portal — Frontend & Multi-Currency', quantity: 1, unitPrice: 5200, total: 5200 }], subtotal: 5200, tax: 0, total: 5200, amountPaid: 0, currency: 'GBP', status: 'draft', issueDate: '2026-06-20', dueDate: '2026-07-20', notes: 'Wire transfer payment details attached.', createdAt: '2026-06-20' },
];

export const initialPayments: Payment[] = [
  { id: 'pay1', invoiceId: 'inv1', amount: 1290000, currency: 'NGN', method: 'bank-transfer', reference: 'TRF-MODE-20260610-884', date: '2026-06-10', notes: 'Stanbic IBTC confirmed deposit' },
  { id: 'pay2', invoiceId: 'inv3', amount: 451500, currency: 'NGN', method: 'paystack', reference: 'PSK-20260320-771', date: '2026-03-20', notes: 'Automatic card payment renewal' },
];

// ==========================================
// OFFICE EXPENSE: REQUISITIONS
// ==========================================
export const initialRequisitions: Requisition[] = [
  {
    id: 'req-1',
    receiptNumber: 'REQ-2026-1042',
    title: 'AWS Cloud Server & Database Monthly Subscription',
    description: 'Production infrastructure renewal for MODE CBT & client hosting droplets',
    amount: 145000,
    currency: 'NGN',
    category: 'Cloud Infrastructure',
    urgency: 'Urgent',
    status: 'Completed',
    staffName: 'Emeka Nwosu',
    staffId: 'u3',
    decisionNotes: 'Approved by MD. Essential for production stability.',
    decidedAt: '2026-06-22T10:15:00Z',
    decidedBy: 'Davids Ogan',
    completedAt: '2026-06-22T11:30:00Z',
    disbursedBy: 'Ibrahim Musa',
    transactionId: 'TXN-GTB-8839219',
    createdAt: '2026-06-22T08:30:00Z',
  },
  {
    id: 'req-2',
    receiptNumber: 'REQ-2026-1043',
    title: 'Quarterly Office Fiber Internet Subscription',
    description: 'Main office dedicated fiber link renewal (Swift Networks)',
    amount: 85000,
    currency: 'NGN',
    category: 'Office Utilities',
    urgency: 'High',
    status: 'Approved',
    staffName: 'Fatima Bello',
    staffId: 'u4',
    decisionNotes: 'Approved. Accounts to disburse via swift online portal.',
    decidedAt: '2026-06-24T14:00:00Z',
    decidedBy: 'Davids Ogan',
    createdAt: '2026-06-24T11:20:00Z',
  },
  {
    id: 'req-3',
    receiptNumber: 'REQ-2026-1044',
    title: 'Facebook Ads & Meta Campaign Budget (Q3)',
    description: 'Lead generation marketing spend targeting Nigerian education & e-commerce sectors',
    amount: 250000,
    currency: 'NGN',
    category: 'Marketing & Ads',
    urgency: 'Medium',
    status: 'Pending',
    staffName: 'Chioma Eze',
    staffId: 'u2',
    createdAt: '2026-06-25T09:45:00Z',
  },
  {
    id: 'req-4',
    receiptNumber: 'REQ-2026-1045',
    title: 'Ergonomic Developer Chair & Dual Monitor Mount',
    description: 'Hardware upgrade for senior developer engineering station',
    amount: 95000,
    currency: 'NGN',
    category: 'Equipment & Hardware',
    urgency: 'Low',
    status: 'Pending',
    staffName: 'Emeka Nwosu',
    staffId: 'u3',
    createdAt: '2026-06-25T16:10:00Z',
  },
];

// ==========================================
// ONE-MINUTE MANAGER: GOALS & FEEDBACK
// ==========================================
export const initialGoals: Goal[] = [
  {
    id: 'g1',
    manager_id: 'u1',
    manager_name: 'Davids Ogan',
    employee_id: 'u2',
    employee_name: 'Chioma Eze',
    objective: 'Generate 15 Qualified Enterprise Leads in Q3',
    expected_result: 'At least 5 proposals sent with total pipeline value exceeding ₦20,000,000',
    deadline: '2026-09-30',
    progress: 60,
    status: 'in_progress',
    strategy_status: 'approved',
    strategy_text: '1. Launch targeted LinkedIn outreach to private secondary school principals for ModeCBT.\n2. Follow up within 24 hours on all website contact form submissions.\n3. Host weekly product walkthrough webinars.',
    strategy_feedback: 'Approved! Excellent structured approach. Prioritize the schools in Lagos & Abuja first.',
    strategy_submitted_at: '2026-06-05T10:00:00Z',
    strategy_approved_at: '2026-06-06T09:30:00Z',
    created_at: '2026-06-01T08:00:00Z',
  },
  {
    id: 'g2',
    manager_id: 'u1',
    manager_name: 'Davids Ogan',
    employee_id: 'u3',
    employee_name: 'Emeka Nwosu',
    objective: 'Unify 3 Internal Codebases into Mode-Ops Next.js Architecture',
    expected_result: 'Zero duplicate auth stores, full Supabase integration, sub-100ms dashboard load times',
    deadline: '2026-08-30',
    progress: 80,
    status: 'in_progress',
    strategy_status: 'approved',
    strategy_text: '1. Merge Supabase schema across CRM, Expense, and OMM.\n2. Rebuild navigation with Next.js App Router and Tailwind v4.\n3. Preserve all existing business logic with offline-first client fallback.',
    strategy_feedback: 'Outstanding roadmap. Let us test with real production data immediately.',
    strategy_submitted_at: '2026-06-02T11:00:00Z',
    strategy_approved_at: '2026-06-02T15:00:00Z',
    created_at: '2026-06-01T08:00:00Z',
  },
  {
    id: 'g3',
    manager_id: 'u4',
    manager_name: 'Fatima Bello',
    employee_id: 'u5',
    employee_name: 'Ibrahim Musa',
    objective: 'Achieve Sub-30-Minute Support Ticket Resolution Time',
    expected_result: 'Customer satisfaction rating above 95% on all hosting and email enquiries',
    deadline: '2026-09-15',
    progress: 75,
    status: 'in_progress',
    strategy_status: 'approved',
    strategy_text: '1. Set up instant Discord/WhatsApp alerts for high-priority tickets.\n2. Pre-configure canned answers for domain renewal and DNS propagation.\n3. Daily morning ticket review.',
    strategy_feedback: 'Great. Make sure escalation procedures to Emeka are well documented.',
    strategy_submitted_at: '2026-06-10T12:00:00Z',
    strategy_approved_at: '2026-06-11T09:00:00Z',
    created_at: '2026-06-08T08:00:00Z',
  },
];

export const initialFeedbacks: Feedback[] = [
  {
    id: 'fb1',
    goal_id: 'g1',
    manager_id: 'u1',
    manager_name: 'Davids Ogan',
    employee_id: 'u2',
    employee_name: 'Chioma Eze',
    type: 'praise',
    details: 'One-Minute Praise: Chioma, your quick response to the UK Trade Connect inquiry secured our largest international project of the quarter! Exceptional professionalism and speed.',
    created_at: '2026-06-15T14:30:00Z',
  },
  {
    id: 'fb2',
    goal_id: 'g2',
    manager_id: 'u1',
    manager_name: 'Davids Ogan',
    employee_id: 'u3',
    employee_name: 'Emeka Nwosu',
    type: 'praise',
    details: 'One-Minute Praise: Emeka, the database schema consolidation was completely seamless. Zero downtime and beautifully formatted PostgreSQL tables. Thank you!',
    created_at: '2026-06-20T17:00:00Z',
  },
  {
    id: 'fb3',
    goal_id: 'g3',
    manager_id: 'u4',
    manager_name: 'Fatima Bello',
    employee_id: 'u5',
    employee_name: 'Ibrahim Musa',
    type: 'redirect',
    details: 'One-Minute Redirect: Ibrahim, noticed two renewal tickets from Sahara Logistics were left unreplied over the weekend. Remember to turn on weekend on-call coverage or auto-acknowledge the receipt so clients know we are on it.',
    created_at: '2026-06-22T09:15:00Z',
  },
];

export const initialTickets: Ticket[] = [
  { id: 'tk1', clientName: 'FashionHub Lagos', clientId: 'c5', subject: 'High-res product images uploading slow on checkout', description: 'When uploading images larger than 5MB, response time degrades. Needs Cloudinary / CDN optimization.', status: 'in-progress', priority: 'high', assignedTo: 'u3', createdAt: '2026-06-18' },
  { id: 'tk2', clientName: 'EduFirst Academy', clientId: 'c3', subject: 'Domain DNS MX record verification for custom email', description: 'Need Google Workspace verification TXT record added to domain DNS settings.', status: 'open', priority: 'medium', assignedTo: 'u5', createdAt: '2026-06-23' },
  { id: 'tk3', clientName: 'TechVenture Nigeria', clientId: 'c1', subject: 'SSL Certificate Auto-Renewal Confirmation', description: 'Confirm SSL certificate renewed properly on port 443 before product launch.', status: 'resolved', priority: 'low', assignedTo: 'u5', createdAt: '2026-06-12' },
];

export const initialActivities: ActivityItem[] = [
  { id: 'act-1', activity_type: 'crm_deal', description: 'FashionHub Lagos made full payment of ₦1,290,000 for Phase 1', entity_type: 'Invoice', entity_id: 'inv1', user_name: 'Chioma Eze', created_at: '2026-06-10 11:30' },
  { id: 'act-2', activity_type: 'expense_approval', description: 'Requisition REQ-2026-1042 (₦145,000) approved & disbursed for Cloud Servers', entity_type: 'Requisition', entity_id: 'req-1', user_name: 'Davids Ogan', created_at: '2026-06-22 11:30' },
  { id: 'act-3', activity_type: 'goal_milestone', description: 'Emeka Nwosu submitted Strategy iteration for unified mode-ops codebase', entity_type: 'Goal', entity_id: 'g2', user_name: 'Emeka Nwosu', created_at: '2026-06-23 15:45' },
  { id: 'act-4', activity_type: 'crm_lead', description: 'New international lead captured from UK: UK Trade Connect (GBP 5,200)', entity_type: 'Lead', entity_id: 'l5', user_name: 'Chioma Eze', created_at: '2026-06-24 09:20' },
];

export const initialNotifications: AppNotification[] = [
  { id: 'notif-1', user_id: 'u1', type: 'expense', title: 'New Requisition Pending', message: 'Chioma Eze requested ₦250,000 for Q3 Marketing & Meta Ads spend.', link_url: '/dashboard/expenses', read: false, created_at: '2026-06-25T09:45:00Z' },
  { id: 'notif-2', user_id: 'u1', type: 'hosting', title: 'Domain Renewal Approaching', message: 'edufirst.ng expires in under 15 days. Auto-renew is turned OFF.', link_url: '/dashboard/crm/hosting', read: false, created_at: '2026-06-25T11:00:00Z' },
  { id: 'notif-3', user_id: 'u2', type: 'feedback', title: 'New One-Minute Praise!', message: 'Davids Ogan sent you praise regarding the UK Trade deal.', link_url: '/dashboard/omm/feedback', read: true, created_at: '2026-06-15T14:30:00Z' },
];
