import type {
  User, Lead, Contact, Company, Project, Task, Service, HostingAccount,
  Invoice, Payment, Ticket, Activity, EmailCampaign,
} from '@/types';

const users: User[] = [
  { id: 'u1', name: 'Adewale Okonkwo', email: 'adewale@modedigital.ng', role: 'admin', phone: '+234 801 234 5678', isActive: true, createdAt: '2024-01-15' },
  { id: 'u2', name: 'Chioma Eze', email: 'chioma@modedigital.ng', role: 'sales', phone: '+234 802 345 6789', isActive: true, createdAt: '2024-02-01' },
  { id: 'u3', name: 'Emeka Nwosu', email: 'emeka@modedigital.ng', role: 'developer', phone: '+234 803 456 7890', isActive: true, createdAt: '2024-02-15' },
  { id: 'u4', name: 'Fatima Bello', email: 'fatima@modedigital.ng', role: 'manager', phone: '+234 804 567 8901', isActive: true, createdAt: '2024-03-01' },
  { id: 'u5', name: 'Ibrahim Musa', email: 'ibrahim@modedigital.ng', role: 'support', phone: '+234 805 678 9012', isActive: true, createdAt: '2024-03-15' },
];

const leads: Lead[] = [
  { id: 'l1', name: 'Chukwudi Abiola', company: 'TechVenture Nigeria', email: 'chukwudi@techventure.ng', phone: '+234 810 111 2222', serviceInterested: 'website-development', source: 'website', budget: 1500000, currency: 'NGN', notes: 'Interested in a corporate website with CMS', status: 'new-lead', estimatedValue: 1500000, probability: 20, expectedCloseDate: '2026-08-15', assignedTo: 'u2', createdAt: '2026-06-01', updatedAt: '2026-06-01' },
  { id: 'l2', name: 'Amina Yusuf', company: 'Sahara Logistics', email: 'amina@saharalog.com', phone: '+234 811 222 3333', serviceInterested: 'ecommerce-development', source: 'facebook-ads', budget: 3000000, currency: 'NGN', notes: 'Needs e-commerce platform for logistics supplies', status: 'qualified', estimatedValue: 3000000, probability: 40, expectedCloseDate: '2026-07-30', assignedTo: 'u2', createdAt: '2026-05-20', updatedAt: '2026-06-05' },
  { id: 'l3', name: 'Olufemi Peters', company: 'EduFirst Academy', email: 'olufemi@edufirst.ng', phone: '+234 812 333 4444', serviceInterested: 'lms-development', source: 'google-ads', budget: 5000000, currency: 'NGN', notes: 'LMS for 500+ students, needs CBT integration', status: 'discovery-call', estimatedValue: 5000000, probability: 60, expectedCloseDate: '2026-07-15', assignedTo: 'u4', createdAt: '2026-05-10', updatedAt: '2026-06-10' },
  { id: 'l4', name: 'Grace Obi', company: 'HealthPlus Clinics', email: 'grace@healthplus.ng', phone: '+234 813 444 5555', serviceInterested: 'custom-software', source: 'referral', budget: 8000000, currency: 'NGN', notes: 'Hospital management system with appointment booking', status: 'proposal-sent', estimatedValue: 8000000, probability: 70, expectedCloseDate: '2026-07-01', assignedTo: 'u4', createdAt: '2026-04-25', updatedAt: '2026-06-12' },
  { id: 'l5', name: 'David Thompson', company: 'UK Trade Connect', email: 'david@uktrade.co.uk', phone: '+44 20 7946 0958', serviceInterested: 'website-development', source: 'website', budget: 5000, currency: 'GBP', notes: 'UK-based company needs website for African market', status: 'negotiation', estimatedValue: 5000, probability: 80, expectedCloseDate: '2026-06-30', assignedTo: 'u2', createdAt: '2026-04-10', updatedAt: '2026-06-15' },
  { id: 'l6', name: 'Ngozi Kalu', company: 'FashionHub Lagos', email: 'ngozi@fashionhub.ng', phone: '+234 814 555 6666', serviceInterested: 'ecommerce-development', source: 'whatsapp', budget: 2000000, currency: 'NGN', notes: 'Online fashion store with payment integration', status: 'won', estimatedValue: 2000000, probability: 100, expectedCloseDate: '2026-06-01', assignedTo: 'u2', createdAt: '2026-03-15', updatedAt: '2026-06-01' },
  { id: 'l7', name: 'Tunde Bakare', company: 'AgriTech Solutions', email: 'tunde@agritech.ng', phone: '+234 815 666 7777', serviceInterested: 'seo-services', source: 'manual', budget: 500000, currency: 'NGN', notes: 'SEO for existing agricultural platform', status: 'contacted', estimatedValue: 500000, probability: 30, expectedCloseDate: '2026-08-01', assignedTo: 'u2', createdAt: '2026-06-10', updatedAt: '2026-06-18' },
  { id: 'l8', name: 'Sandra Onu', company: 'Real Estate Plus', email: 'sandra@realestate.ng', phone: '+234 816 777 8888', serviceInterested: 'website-development', source: 'csv-import', budget: 1200000, currency: 'NGN', notes: 'Property listing website', status: 'lost', estimatedValue: 1200000, probability: 0, expectedCloseDate: '2026-05-15', assignedTo: 'u4', createdAt: '2026-03-01', updatedAt: '2026-05-15' },
  { id: 'l9', name: 'Michael Adeyemi', company: 'FinServe Nigeria', email: 'michael@finserve.ng', phone: '+234 817 888 9999', serviceInterested: 'custom-software', source: 'referral', budget: 12000000, currency: 'NGN', notes: 'Fintech dashboard and payment processing system', status: 'proposal-sent', estimatedValue: 12000000, probability: 65, expectedCloseDate: '2026-07-20', assignedTo: 'u4', createdAt: '2026-05-05', updatedAt: '2026-06-14' },
  { id: 'l10', name: 'John Smith', company: 'Global Ventures LLC', email: 'john@globalventures.com', phone: '+1 212 555 0199', serviceInterested: 'web-hosting', source: 'google-ads', budget: 2400, currency: 'USD', notes: 'Hosting for 10 websites targeting African market', status: 'new-lead', estimatedValue: 2400, probability: 15, expectedCloseDate: '2026-09-01', assignedTo: 'u2', createdAt: '2026-06-20', updatedAt: '2026-06-20' },
];

const contacts: Contact[] = [
  { id: 'c1', name: 'Chukwudi Abiola', email: 'chukwudi@techventure.ng', phone: '+234 810 111 2222', company: 'TechVenture Nigeria', position: 'CEO', notes: '', isActive: true, createdAt: '2026-06-01' },
  { id: 'c2', name: 'Amina Yusuf', email: 'amina@saharalog.com', phone: '+234 811 222 3333', company: 'Sahara Logistics', position: 'Operations Director', notes: '', isActive: true, createdAt: '2026-05-20' },
  { id: 'c3', name: 'Olufemi Peters', email: 'olufemi@edufirst.ng', phone: '+234 812 333 4444', company: 'EduFirst Academy', position: 'Principal', notes: '', isActive: true, createdAt: '2026-05-10' },
  { id: 'c4', name: 'Grace Obi', email: 'grace@healthplus.ng', phone: '+234 813 444 5555', company: 'HealthPlus Clinics', position: 'Managing Director', notes: '', isActive: true, createdAt: '2026-04-25' },
  { id: 'c5', name: 'Ngozi Kalu', email: 'ngozi@fashionhub.ng', phone: '+234 814 555 6666', company: 'FashionHub Lagos', position: 'Founder', notes: 'Active client since June 2026', isActive: true, createdAt: '2026-03-15' },
  { id: 'c6', name: 'David Thompson', email: 'david@uktrade.co.uk', phone: '+44 20 7946 0958', company: 'UK Trade Connect', position: 'Business Development', notes: '', isActive: true, createdAt: '2026-04-10' },
];

const companies: Company[] = [
  { id: 'co1', name: 'TechVenture Nigeria', industry: 'Technology', website: 'techventure.ng', email: 'info@techventure.ng', phone: '+234 810 111 2222', address: '15 Admiralty Way, Lekki, Lagos', contactIds: ['c1'], createdAt: '2026-06-01' },
  { id: 'co2', name: 'Sahara Logistics', industry: 'Logistics', website: 'saharalog.com', email: 'info@saharalog.com', phone: '+234 811 222 3333', address: '42 Marina Road, Lagos Island', contactIds: ['c2'], createdAt: '2026-05-20' },
  { id: 'co3', name: 'EduFirst Academy', industry: 'Education', website: 'edufirst.ng', email: 'admin@edufirst.ng', phone: '+234 812 333 4444', address: '8 University Road, Ibadan, Oyo', contactIds: ['c3'], createdAt: '2026-05-10' },
  { id: 'co4', name: 'HealthPlus Clinics', industry: 'Healthcare', website: 'healthplus.ng', email: 'info@healthplus.ng', phone: '+234 813 444 5555', address: '22 Awolowo Road, Ikoyi, Lagos', contactIds: ['c4'], createdAt: '2026-04-25' },
  { id: 'co5', name: 'FashionHub Lagos', industry: 'Retail / Fashion', website: 'fashionhub.ng', email: 'hello@fashionhub.ng', phone: '+234 814 555 6666', address: '5 Allen Avenue, Ikeja, Lagos', contactIds: ['c5'], createdAt: '2026-03-15' },
];

const projects: Project[] = [
  { id: 'p1', name: 'FashionHub E-commerce Platform', description: 'Full e-commerce platform with payment integration, inventory management, and delivery tracking', clientId: 'c5', clientName: 'Ngozi Kalu', serviceType: 'ecommerce-development', status: 'in-progress', startDate: '2026-06-05', endDate: '2026-08-30', budget: 2000000, currency: 'NGN', progress: 35, assignedTeam: ['u3', 'u4'], dealId: 'l6', createdAt: '2026-06-05' },
  { id: 'p2', name: 'MODE Digital Website Redesign', description: 'Redesign of company website with modern UI/UX', clientId: 'c1', clientName: 'Internal', serviceType: 'website-development', status: 'in-progress', startDate: '2026-05-01', endDate: '2026-07-15', budget: 500000, currency: 'NGN', progress: 70, assignedTeam: ['u3'], createdAt: '2026-05-01' },
  { id: 'p3', name: 'AgriTech SEO Campaign', description: 'Complete SEO overhaul for agricultural platform', clientId: 'c1', clientName: 'Tunde Bakare', serviceType: 'seo-services', status: 'pending', startDate: '2026-07-01', endDate: '2026-09-30', budget: 500000, currency: 'NGN', progress: 0, assignedTeam: ['u4'], createdAt: '2026-06-18' },
];

const tasks: Task[] = [
  { id: 't1', projectId: 'p1', title: 'Requirement Gathering', description: 'Collect all client requirements and create specification document', status: 'completed', assignedTo: 'u4', dueDate: '2026-06-10', priority: 'high', order: 1, createdAt: '2026-06-05' },
  { id: 't2', projectId: 'p1', title: 'Wireframe Design', description: 'Create wireframes for all pages', status: 'completed', assignedTo: 'u3', dueDate: '2026-06-17', priority: 'high', order: 2, createdAt: '2026-06-05' },
  { id: 't3', projectId: 'p1', title: 'UI Design', description: 'Design all pages in Figma', status: 'in-progress', assignedTo: 'u3', dueDate: '2026-06-28', priority: 'high', order: 3, createdAt: '2026-06-05' },
  { id: 't4', projectId: 'p1', title: 'Frontend Development', description: 'Build React frontend with Tailwind CSS', status: 'pending', assignedTo: 'u3', dueDate: '2026-07-20', priority: 'medium', order: 4, createdAt: '2026-06-05' },
  { id: 't5', projectId: 'p1', title: 'Backend Development', description: 'Build Node.js API with payment integration', status: 'pending', assignedTo: 'u3', dueDate: '2026-08-01', priority: 'medium', order: 5, createdAt: '2026-06-05' },
  { id: 't6', projectId: 'p1', title: 'Testing', description: 'Full testing and QA', status: 'pending', assignedTo: 'u3', dueDate: '2026-08-15', priority: 'high', order: 6, createdAt: '2026-06-05' },
  { id: 't7', projectId: 'p1', title: 'Client Review', description: 'Present to client and collect feedback', status: 'pending', assignedTo: 'u4', dueDate: '2026-08-22', priority: 'medium', order: 7, createdAt: '2026-06-05' },
  { id: 't8', projectId: 'p1', title: 'Deployment', description: 'Deploy to production server', status: 'pending', assignedTo: 'u3', dueDate: '2026-08-28', priority: 'high', order: 8, createdAt: '2026-06-05' },
  { id: 't9', projectId: 'p2', title: 'Design Mockups', description: 'Create new website mockups', status: 'completed', assignedTo: 'u3', dueDate: '2026-05-15', priority: 'high', order: 1, createdAt: '2026-05-01' },
  { id: 't10', projectId: 'p2', title: 'Frontend Implementation', description: 'Build the new frontend', status: 'in-progress', assignedTo: 'u3', dueDate: '2026-06-30', priority: 'high', order: 2, createdAt: '2026-05-01' },
  { id: 't11', projectId: 'p2', title: 'Content Migration', description: 'Migrate content to new design', status: 'pending', assignedTo: 'u4', dueDate: '2026-07-10', priority: 'medium', order: 3, createdAt: '2026-05-01' },
];

const services: Service[] = [
  { id: 's1', name: 'Website Development', type: 'website-development', description: 'Custom responsive websites built with modern technologies', basePrice: 500000, currency: 'NGN', isActive: true, features: ['Responsive Design', 'SEO Optimized', 'CMS Integration', 'Contact Forms', 'Analytics Setup'] },
  { id: 's2', name: 'E-commerce Development', type: 'ecommerce-development', description: 'Full-featured online stores with payment integration', basePrice: 1500000, currency: 'NGN', isActive: true, features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Inventory Management', 'Order Tracking', 'Admin Dashboard'] },
  { id: 's3', name: 'LMS Development', type: 'lms-development', description: 'Learning management systems for educational institutions', basePrice: 3000000, currency: 'NGN', isActive: true, features: ['Course Management', 'Student Enrollment', 'Quiz/Assessment', 'Progress Tracking', 'Certificate Generation', 'Video Hosting'] },
  { id: 's4', name: 'Custom Software Development', type: 'custom-software', description: 'Bespoke software solutions tailored to your business needs', basePrice: 5000000, currency: 'NGN', isActive: true, features: ['Requirements Analysis', 'Custom Architecture', 'API Development', 'Database Design', 'Testing & QA', 'Deployment'] },
  { id: 's5', name: 'SEO Services', type: 'seo-services', description: 'Search engine optimization to improve your online visibility', basePrice: 150000, currency: 'NGN', isActive: true, features: ['Keyword Research', 'On-Page SEO', 'Technical SEO', 'Link Building', 'Monthly Reports', 'Competitor Analysis'] },
  { id: 's6', name: 'Web Hosting', type: 'web-hosting', description: 'Reliable hosting solutions with 99.9% uptime guarantee', basePrice: 30000, currency: 'NGN', isActive: true, features: ['99.9% Uptime', 'Free SSL', 'Daily Backups', '24/7 Support', 'CDN Integration'] },
  { id: 's7', name: 'Domain Registration', type: 'domain-registration', description: 'Register and manage domain names', basePrice: 5000, currency: 'NGN', isActive: true, features: ['Domain Search', 'DNS Management', 'Privacy Protection', 'Auto-Renewal', 'Transfer Support'] },
  { id: 's8', name: 'Graphic Design', type: 'graphic-design', description: 'Professional graphic design for branding and marketing', basePrice: 100000, currency: 'NGN', isActive: true, features: ['Logo Design', 'Brand Identity', 'Marketing Materials', 'Social Media Graphics', 'Print Design'] },
  { id: 's9', name: 'Social Media Management', type: 'social-media-management', description: 'Complete social media management and content creation', basePrice: 200000, currency: 'NGN', isActive: true, features: ['Content Strategy', 'Post Scheduling', 'Community Management', 'Analytics & Reports', 'Ad Campaign Management'] },
  { id: 's10', name: 'CBT Platform Solutions', type: 'cbt-platform', description: 'Computer-based testing platforms for exams and assessments', basePrice: 2000000, currency: 'NGN', isActive: true, features: ['Question Bank', 'Timed Exams', 'Auto-Grading', 'Result Analysis', 'Anti-Cheating', 'Bulk Student Upload'] },
];

const hostingAccounts: HostingAccount[] = [
  { id: 'h1', clientId: 'c5', clientName: 'FashionHub Lagos', domainName: 'fashionhub.ng', registrationDate: '2025-06-01', expiryDate: '2027-06-01', hostingPlan: 'business', sslStatus: 'active', autoRenew: true, status: 'active', monthlyFee: 15000, currency: 'NGN' },
  { id: 'h2', clientId: 'c1', clientName: 'TechVenture Nigeria', domainName: 'techventure.ng', registrationDate: '2025-03-15', expiryDate: '2026-09-15', hostingPlan: 'enterprise', sslStatus: 'active', autoRenew: true, status: 'active', monthlyFee: 25000, currency: 'NGN' },
  { id: 'h3', clientId: 'c3', clientName: 'EduFirst Academy', domainName: 'edufirst.ng', registrationDate: '2025-01-10', expiryDate: '2026-07-10', hostingPlan: 'business', sslStatus: 'active', autoRenew: false, status: 'active', monthlyFee: 15000, currency: 'NGN' },
  { id: 'h4', clientId: 'c4', clientName: 'HealthPlus Clinics', domainName: 'healthplus.ng', registrationDate: '2024-08-20', expiryDate: '2026-08-20', hostingPlan: 'enterprise', sslStatus: 'active', autoRenew: true, status: 'active', monthlyFee: 25000, currency: 'NGN' },
  { id: 'h5', clientId: 'c2', clientName: 'Sahara Logistics', domainName: 'saharalog.com', registrationDate: '2025-11-05', expiryDate: '2026-11-05', hostingPlan: 'starter', sslStatus: 'active', autoRenew: true, status: 'active', monthlyFee: 8000, currency: 'NGN' },
];

const invoices: Invoice[] = [
  { id: 'inv1', invoiceNumber: 'INV-2026-001', clientId: 'c5', clientName: 'FashionHub Lagos', clientEmail: 'ngozi@fashionhub.ng', projectId: 'p1', items: [{ id: 'ii1', description: 'E-commerce Platform Development - Phase 1', quantity: 1, unitPrice: 800000, total: 800000 }, { id: 'ii2', description: 'UI/UX Design', quantity: 1, unitPrice: 200000, total: 200000 }], subtotal: 1000000, tax: 75000, total: 1075000, amountPaid: 1075000, currency: 'NGN', status: 'paid', issueDate: '2026-06-05', dueDate: '2026-06-20', notes: 'Phase 1 payment', createdAt: '2026-06-05' },
  { id: 'inv2', invoiceNumber: 'INV-2026-002', clientId: 'c5', clientName: 'FashionHub Lagos', clientEmail: 'ngozi@fashionhub.ng', projectId: 'p1', items: [{ id: 'ii3', description: 'E-commerce Platform Development - Phase 2', quantity: 1, unitPrice: 925000, total: 925000 }], subtotal: 925000, tax: 69375, total: 994375, amountPaid: 0, currency: 'NGN', status: 'sent', issueDate: '2026-06-20', dueDate: '2026-07-05', notes: 'Phase 2 payment due upon completion of UI design', createdAt: '2026-06-20' },
  { id: 'inv3', invoiceNumber: 'INV-2026-003', clientId: 'c1', clientName: 'TechVenture Nigeria', clientEmail: 'chukwudi@techventure.ng', items: [{ id: 'ii4', description: 'Annual Hosting - Enterprise Plan', quantity: 12, unitPrice: 25000, total: 300000 }], subtotal: 300000, tax: 22500, total: 322500, amountPaid: 322500, currency: 'NGN', status: 'paid', issueDate: '2026-03-15', dueDate: '2026-04-15', notes: 'Annual hosting renewal', createdAt: '2026-03-15' },
  { id: 'inv4', invoiceNumber: 'INV-2026-004', clientId: 'c3', clientName: 'EduFirst Academy', clientEmail: 'olufemi@edufirst.ng', items: [{ id: 'ii5', description: 'Hosting Plan - Business', quantity: 6, unitPrice: 15000, total: 90000 }, { id: 'ii6', description: 'SSL Certificate', quantity: 1, unitPrice: 15000, total: 15000 }], subtotal: 105000, tax: 7875, total: 112875, amountPaid: 50000, currency: 'NGN', status: 'partially-paid', issueDate: '2026-05-10', dueDate: '2026-06-10', notes: '', createdAt: '2026-05-10' },
  { id: 'inv5', invoiceNumber: 'INV-2026-005', clientId: 'c6', clientName: 'UK Trade Connect', clientEmail: 'david@uktrade.co.uk', items: [{ id: 'ii7', description: 'Website Development', quantity: 1, unitPrice: 5000, total: 5000 }], subtotal: 5000, tax: 0, total: 5000, amountPaid: 0, currency: 'GBP', status: 'draft', issueDate: '2026-06-20', dueDate: '2026-07-20', notes: 'Pending contract signing', createdAt: '2026-06-20' },
];

const payments: Payment[] = [
  { id: 'pay1', invoiceId: 'inv1', amount: 1075000, currency: 'NGN', method: 'bank-transfer', reference: 'TRF-20260610-001', date: '2026-06-10', notes: 'Full payment received' },
  { id: 'pay2', invoiceId: 'inv3', amount: 322500, currency: 'NGN', method: 'paystack', reference: 'PSK-20260320-002', date: '2026-03-20', notes: 'Annual hosting payment' },
  { id: 'pay3', invoiceId: 'inv4', amount: 50000, currency: 'NGN', method: 'bank-transfer', reference: 'TRF-20260515-003', date: '2026-05-15', notes: 'Partial payment' },
];

const tickets: Ticket[] = [
  { id: 'tk1', clientId: 'c5', clientName: 'FashionHub Lagos', subject: 'Product upload not working', description: 'Unable to upload product images larger than 2MB', status: 'open', priority: 'high', assignedTo: 'u5', createdAt: '2026-06-18', updatedAt: '2026-06-18' },
  { id: 'tk2', clientId: 'c1', clientName: 'TechVenture Nigeria', subject: 'Email forwarding issue', description: 'Emails sent to info@ are not being forwarded to team', status: 'in-progress', priority: 'medium', assignedTo: 'u5', createdAt: '2026-06-15', updatedAt: '2026-06-17' },
  { id: 'tk3', clientId: 'c3', clientName: 'EduFirst Academy', subject: 'SSL certificate renewal', description: 'SSL certificate expiring soon, please renew', status: 'resolved', priority: 'high', assignedTo: 'u5', createdAt: '2026-06-10', updatedAt: '2026-06-12' },
];

const activities: Activity[] = [
  { id: 'a1', type: 'lead-created', description: 'New lead created: John Smith from Global Ventures LLC', entityType: 'lead', entityId: 'l10', userId: 'u2', userName: 'Chioma Eze', createdAt: '2026-06-20T14:30:00' },
  { id: 'a2', type: 'deal-update', description: 'Deal with UK Trade Connect moved to Negotiation', entityType: 'deal', entityId: 'l5', userId: 'u2', userName: 'Chioma Eze', createdAt: '2026-06-15T11:00:00' },
  { id: 'a3', type: 'invoice-sent', description: 'Invoice INV-2026-002 sent to FashionHub Lagos', entityType: 'invoice', entityId: 'inv2', userId: 'u4', userName: 'Fatima Bello', createdAt: '2026-06-20T09:15:00' },
  { id: 'a4', type: 'call', description: 'Discovery call with EduFirst Academy - discussed LMS requirements', entityType: 'lead', entityId: 'l3', userId: 'u4', userName: 'Fatima Bello', createdAt: '2026-06-10T15:00:00' },
  { id: 'a5', type: 'email', description: 'Proposal sent to HealthPlus Clinics for hospital management system', entityType: 'lead', entityId: 'l4', userId: 'u4', userName: 'Fatima Bello', createdAt: '2026-06-12T10:30:00' },
  { id: 'a6', type: 'meeting', description: 'Team meeting to review FashionHub project progress', entityType: 'project', entityId: 'p1', userId: 'u1', userName: 'Adewale Okonkwo', createdAt: '2026-06-19T14:00:00' },
  { id: 'a7', type: 'task', description: 'Wireframe design completed for FashionHub e-commerce', entityType: 'project', entityId: 'p1', userId: 'u3', userName: 'Emeka Nwosu', createdAt: '2026-06-17T16:45:00' },
  { id: 'a8', type: 'note', description: 'Client requested additional payment gateway: Flutterwave', entityType: 'project', entityId: 'p1', userId: 'u3', userName: 'Emeka Nwosu', createdAt: '2026-06-16T11:20:00' },
];

const emailCampaigns: EmailCampaign[] = [
  { id: 'ec1', name: 'New Lead Welcome Series', type: 'lead-nurture', status: 'active', recipientCount: 25, sentCount: 18, openRate: 62, clickRate: 28, createdAt: '2026-05-01' },
  { id: 'ec2', name: 'Hosting Renewal Reminders - Q3', type: 'hosting-renewal', status: 'active', recipientCount: 12, sentCount: 8, openRate: 75, clickRate: 45, createdAt: '2026-06-01' },
  { id: 'ec3', name: 'Service Promotion - June 2026', type: 'custom', status: 'completed', recipientCount: 150, sentCount: 150, openRate: 38, clickRate: 12, createdAt: '2026-06-01' },
];

export const seedData = {
  currentUser: users[0],
  users,
  leads,
  contacts,
  companies,
  projects,
  tasks,
  services,
  hostingAccounts,
  invoices,
  payments,
  tickets,
  activities,
  emailCampaigns,
};
