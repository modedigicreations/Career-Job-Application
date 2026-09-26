-- ============================================================
-- MODE Operations Suite (mode-ops) Unified Database Schema
-- Merging:
--   1. CRM (Leads, Deals, Contacts, Companies, Projects, Tasks, Hosting, Invoices, Tickets)
--   2. Office-Expense (Staff Requisitions, Multi-Tier Approvals, Receipts)
--   3. One-Minute Manager (Goals, Strategy Iterations, Praisings & Feedback, Role Hierarchy)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS & PROFILES (Extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL UNIQUE,
  full_name    TEXT,
  role         TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('managing_director', 'manager', 'employee', 'admin', 'sales', 'support', 'developer', 'accounts')),
  manager_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  department   TEXT DEFAULT 'General',
  job_title    TEXT,
  phone        TEXT,
  avatar_url   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: Automatically create public profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    manager_id,
    department,
    job_title,
    phone
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'manager_id' IS NULL 
           OR NEW.raw_user_meta_data->>'manager_id' = '' 
           OR NEW.raw_user_meta_data->>'manager_id' = 'undefined' THEN NULL
      ELSE (NEW.raw_user_meta_data->>'manager_id')::uuid
    END,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'department'), ''), 'General'),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'job_title'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. ONE-MINUTE MANAGER: GOALS, STRATEGY, FEEDBACK
-- ============================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  objective             TEXT NOT NULL,
  expected_result       TEXT NOT NULL,
  deadline              DATE NOT NULL,
  progress              INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status                TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'behind')),
  strategy_status       TEXT NOT NULL DEFAULT 'pending_submission' CHECK (strategy_status IN ('pending_submission', 'submitted', 'approved', 'revision_requested')),
  strategy_text         TEXT,
  strategy_feedback     TEXT,
  strategy_submitted_at TIMESTAMPTZ,
  strategy_approved_at  TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goal_strategy_iterations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id          UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role      TEXT NOT NULL,
  action_type      TEXT NOT NULL CHECK (action_type IN ('submitted', 'revision_requested', 'approved', 'co_edited')),
  strategy_content TEXT NOT NULL,
  feedback_note    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id      UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  manager_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('praise', 'redirect')),
  details      TEXT NOT NULL,
  viewed_at    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. OFFICE-EXPENSE: REQUISITIONS & FINANCIAL APPROVALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.requisitions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number  TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT,
  amount          NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency        TEXT NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN', 'GBP', 'USD')),
  category        TEXT NOT NULL,
  urgency         TEXT NOT NULL DEFAULT 'Medium' CHECK (urgency IN ('Low', 'Medium', 'High', 'Urgent')),
  status          TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
  staff_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  staff_name      TEXT NOT NULL,
  decision_notes  TEXT,
  decided_at      TIMESTAMPTZ,
  decided_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at    TIMESTAMPTZ,
  disbursed_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  transaction_id  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. CRM: CLIENTS, PIPELINE, DEALS & LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  industry    TEXT,
  website     TEXT,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  position    TEXT,
  notes       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  company             TEXT NOT NULL,
  company_id          UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id          UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  service_interested  TEXT NOT NULL,
  source              TEXT NOT NULL CHECK (source IN ('website', 'facebook-ads', 'google-ads', 'whatsapp', 'manual', 'csv-import', 'referral')),
  budget              NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN', 'GBP', 'USD')),
  notes               TEXT,
  status              TEXT NOT NULL DEFAULT 'new-lead' CHECK (status IN ('new-lead', 'qualified', 'contacted', 'discovery-call', 'proposal-sent', 'negotiation', 'won', 'lost')),
  estimated_value     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  probability         INTEGER NOT NULL DEFAULT 20 CHECK (probability BETWEEN 0 AND 100),
  expected_close_date DATE,
  assigned_to         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. CRM: PROJECTS & TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT,
  client_name  TEXT NOT NULL,
  contact_id   UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'on-hold', 'cancelled')),
  start_date   DATE,
  end_date     DATE,
  budget       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency     TEXT NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN', 'GBP', 'USD')),
  progress     INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  lead_id      UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked')),
  priority     TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date     DATE,
  task_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. CRM: HOSTING & DOMAIN ASSETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hosting_accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name       TEXT NOT NULL,
  domain_name       TEXT NOT NULL,
  contact_id        UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  registration_date DATE,
  expiry_date       DATE NOT NULL,
  hosting_plan      TEXT NOT NULL DEFAULT 'starter' CHECK (hosting_plan IN ('starter', 'business', 'enterprise', 'custom')),
  ssl_status        TEXT NOT NULL DEFAULT 'active' CHECK (ssl_status IN ('active', 'expired', 'none', 'pending')),
  auto_renew        BOOLEAN NOT NULL DEFAULT FALSE,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'cancelled')),
  monthly_fee       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN', 'GBP', 'USD')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. CRM: INVOICES & PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_name    TEXT NOT NULL,
  client_email   TEXT NOT NULL,
  project_id     UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  items          JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax            NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total          NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_paid    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN', 'GBP', 'USD')),
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partially-paid', 'overdue', 'cancelled')),
  issue_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date       DATE NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id  UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount      NUMERIC(12, 2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN', 'GBP', 'USD')),
  method      TEXT NOT NULL CHECK (method IN ('bank-transfer', 'paystack', 'flutterwave', 'stripe', 'cash', 'other')),
  reference   TEXT,
  notes       TEXT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. CRM: SERVICES, TICKETS, CAMPAIGNS & NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  description TEXT,
  base_price  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN', 'GBP', 'USD')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  features    JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  subject     TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  link_url   TEXT,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_strategy_iterations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Base authenticated access policies (users can read operational records)
CREATE POLICY "Allow authenticated read on profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow authenticated access to crm entities" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to requisitions" ON public.requisitions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hosting" ON public.hosting_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to contacts" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to companies" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to tickets" ON public.tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to activities" ON public.activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to goals" ON public.goals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to strategy iterations" ON public.goal_strategy_iterations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to feedbacks" ON public.feedbacks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow user read own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
