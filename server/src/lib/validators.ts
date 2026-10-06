import { z } from 'zod';

// HTML <input type="date"> sends date-only strings ("2026-10-06"), not full ISO
// datetimes — z.string().datetime() rejects those. Accept anything Date.parse()
// understands, and treat an empty string the same as "not provided".
const flexibleDate = z.string()
  .refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid date' })
  .transform((v) => new Date(v));
const optionalDate = () =>
  z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    flexibleDate.optional().nullable()
  );
// Same as optionalDate(), but never nullable — for fields with a non-nullable DB default
// (e.g. `@default(now())`), where Prisma's generated input type rejects an explicit null.
const optionalDateNotNull = () =>
  z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    flexibleDate.optional()
  );

export const leadSchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  email: z.string().email().max(254),
  phone: z.string().max(50).optional().nullable(),
  serviceInterested: z.string().min(1).max(100),
  source: z.string().min(1).max(50),
  budget: z.number().min(0).default(0),
  currency: z.enum(['NGN', 'GBP', 'USD']).default('NGN'),
  notes: z.string().max(2000).optional().nullable(),
  designation: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  status: z.enum(['new-lead', 'qualified', 'contacted', 'discovery-call', 'proposal-sent', 'negotiation', 'won', 'lost']).default('new-lead'),
  estimatedValue: z.number().min(0).default(0),
  probability: z.number().min(0).max(100).default(20),
  expectedCloseDate: optionalDate(),
  assignedTo: z.string().uuid().optional().nullable(),
});

export const leadUpdateSchema = leadSchema.partial();

export const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(254),
  phone: z.string().max(50).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  position: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const contactUpdateSchema = contactSchema.partial();

export const companySchema = z.object({
  name: z.string().min(1).max(200),
  industry: z.string().max(100).optional().nullable(),
  website: z.string().max(500).optional().nullable(),
  email: z.string().email().max(254).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
});

export const companyUpdateSchema = companySchema.partial();

export const projectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  clientName: z.string().min(1).max(200),
  serviceType: z.string().min(1).max(100),
  status: z.enum(['pending', 'in-progress', 'completed', 'on-hold', 'cancelled']).default('pending'),
  startDate: optionalDate(),
  endDate: optionalDate(),
  budget: z.number().min(0).default(0),
  currency: z.enum(['NGN', 'GBP', 'USD']).default('NGN'),
  progress: z.number().min(0).max(100).default(0),
  assignedTeam: z.array(z.string()).default([]),
});

export const projectUpdateSchema = projectSchema.partial();

export const taskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed', 'blocked']).default('pending'),
  assignedTo: z.string().uuid().optional().nullable(),
  dueDate: optionalDate(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  order: z.number().int().min(0).default(0),
});

export const taskUpdateSchema = taskSchema.partial();

export const serviceSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  description: z.string().max(2000).optional().nullable(),
  basePrice: z.number().min(0).default(0),
  currency: z.enum(['NGN', 'GBP', 'USD']).default('NGN'),
  isActive: z.boolean().default(true),
  features: z.array(z.string().max(200)).default([]),
});

export const serviceUpdateSchema = serviceSchema.partial();

export const hostingSchema = z.object({
  clientName: z.string().min(1).max(200),
  domainName: z.string().min(1).max(253),
  registrationDate: optionalDate(),
  expiryDate: flexibleDate,
  hostingPlan: z.enum(['starter', 'business', 'enterprise', 'custom']).default('starter'),
  sslStatus: z.enum(['active', 'expired', 'none']).default('none'),
  autoRenew: z.boolean().default(false),
  status: z.enum(['active', 'suspended', 'expired']).default('active'),
  monthlyFee: z.number().min(0).default(0),
  currency: z.enum(['NGN', 'GBP', 'USD']).default('NGN'),
});

export const hostingUpdateSchema = hostingSchema.partial();

export const invoiceCreateSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().max(254),
  items: z.array(z.object({
    description: z.string().min(1).max(500),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
    total: z.number().min(0),
  })).min(1),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  currency: z.enum(['NGN', 'GBP', 'USD']).default('NGN'),
  status: z.enum(['draft', 'sent', 'paid', 'partially-paid', 'overdue', 'cancelled']).default('draft'),
  issueDate: z.string().optional(),
  dueDate: z.string().min(1),
  notes: z.string().max(2000).optional().nullable(),
});

export const invoiceUpdateSchema = z.object({
  clientName: z.string().min(1).max(200).optional(),
  clientEmail: z.string().email().max(254).optional(),
  items: z.array(z.object({
    description: z.string().min(1).max(500),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
    total: z.number().min(0),
  })).optional(),
  subtotal: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
  currency: z.enum(['NGN', 'GBP', 'USD']).optional(),
  status: z.enum(['draft', 'sent', 'paid', 'partially-paid', 'overdue', 'cancelled']).optional(),
  dueDate: z.string().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const paymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(['NGN', 'GBP', 'USD']).optional(),
  method: z.enum(['bank-transfer', 'card', 'cash', 'paystack', 'flutterwave']),
  reference: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const ticketSchema = z.object({
  clientName: z.string().min(1).max(200),
  subject: z.string().min(1).max(300),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']).default('open'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().uuid().optional().nullable(),
});

export const ticketUpdateSchema = ticketSchema.partial();

export const activitySchema = z.object({
  type: z.string().min(1).max(50),
  description: z.string().min(1).max(1000),
  entityType: z.string().min(1).max(50),
  entityId: z.string().min(1).max(100),
  userId: z.string().uuid().optional().nullable(),
  userName: z.string().min(1).max(200),
});

export const campaignSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['lead-nurture', 'hosting-renewal', 'custom']),
  status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft'),
  recipientCount: z.number().int().min(0).default(0),
  sentCount: z.number().int().min(0).default(0),
  openRate: z.number().min(0).max(100).default(0),
  clickRate: z.number().min(0).max(100).default(0),
});

export const campaignUpdateSchema = campaignSchema.partial();

export const personalGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  targetDate: optionalDate(),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
});

export const personalGoalUpdateSchema = personalGoalSchema.partial();

export const managerTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  assignedTo: z.string().uuid(),
  dueDate: optionalDate(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in-progress', 'completed', 'blocked']).default('pending'),
});

// Assignees may only update status/description — not reassign or re-title the task.
export const managerTaskAssigneeUpdateSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'completed', 'blocked']).optional(),
  description: z.string().max(2000).optional().nullable(),
});

export const managerTaskOwnerUpdateSchema = managerTaskSchema.partial();

export const dailySummarySchema = z.object({
  date: flexibleDate,
  note: z.string().min(1).max(2000),
});

export const requisitionSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['NGN', 'GBP', 'USD']).default('NGN'),
  category: z.string().min(1).max(100),
  reason: z.string().min(1).max(1000),
  date: optionalDateNotNull(),
});
