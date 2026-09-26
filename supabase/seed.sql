-- ============================================================
-- MODE Operations Suite (mode-ops) Seed Data
-- ============================================================

-- 1. Insert Initial Services
INSERT INTO public.services (name, type, description, base_price, currency, is_active, features)
VALUES 
  ('Custom Website Development', 'website-development', 'Enterprise responsive web applications built with Next.js & Tailwind', 650000, 'NGN', true, '["Next.js Architecture", "High Performance Core Web Vitals", "CMS Integration", "Enterprise SEO", "Analytics & Tag Manager"]'::jsonb),
  ('E-commerce Platforms', 'ecommerce-development', 'High-converting online storefronts with payment gateway integrations', 1800000, 'NGN', true, '["Product Catalog", "Paystack / Flutterwave", "Inventory Management", "Order Tracking", "Customer Portal"]'::jsonb),
  ('Learning Management System (LMS)', 'lms-development', 'Scalable educational platforms with student and instructor dashboards', 3500000, 'NGN', true, '["Course Builder", "Student Progress", "Video Hosting", "Automated Certification", "Assignment Grading"]'::jsonb),
  ('ModeCBT Examination Platform', 'cbt-platform', 'Ultra-reliable Computer-Based Testing platform for institutions', 2500000, 'NGN', true, '["Timed Exams", "Randomized Questions", "Offline-Resilient Architecture", "Real-time Analytics", "Tamper Resistance"]'::jsonb),
  ('Managed Cloud Web Hosting', 'web-hosting', 'High-availability SSD hosting with daily automated backups and SSL', 35000, 'NGN', true, '["99.9% Uptime SLA", "Free SSL Certificates", "Automated Daily Backups", "24/7 Monitoring", "cPanel & SSH Access"]'::jsonb)
ON CONFLICT DO NOTHING;

-- 2. Insert Initial Companies
INSERT INTO public.companies (name, industry, website, email, phone, address)
VALUES 
  ('TechVenture Nigeria', 'FinTech / SaaS', 'https://techventure.ng', 'info@techventure.ng', '+234 810 111 2222', '15 Admiralty Way, Lekki Phase 1, Lagos'),
  ('Sahara Logistics', 'Logistics & Supply Chain', 'https://saharalog.com', 'operations@saharalog.com', '+234 811 222 3333', '42 Marina Road, Lagos Island, Lagos'),
  ('EduFirst Academy', 'Education', 'https://edufirst.ng', 'admin@edufirst.ng', '+234 812 333 4444', '8 University Crescent, Bodija, Ibadan, Oyo'),
  ('HealthPlus Clinics', 'Healthcare', 'https://healthplus.ng', 'contact@healthplus.ng', '+234 813 444 5555', '22 Awolowo Road, Ikoyi, Lagos'),
  ('FashionHub Lagos', 'Retail & Fashion', 'https://fashionhub.ng', 'orders@fashionhub.ng', '+234 814 555 6666', '5 Allen Avenue, Ikeja, Lagos')
ON CONFLICT DO NOTHING;

-- 3. Insert Initial Contacts
INSERT INTO public.contacts (name, email, phone, position, notes, is_active)
VALUES 
  ('Chukwudi Abiola', 'chukwudi@techventure.ng', '+234 810 111 2222', 'CEO & Founder', 'Prefers WhatsApp updates on weekdays', true),
  ('Amina Yusuf', 'amina@saharalog.com', '+234 811 222 3333', 'VP Operations', 'Requested demo of freight tracking', true),
  ('Olufemi Peters', 'olufemi@edufirst.ng', '+234 812 333 4444', 'Principal Administrator', 'Needs exam schedule ready before term resumes', true),
  ('Grace Obi', 'grace@healthplus.ng', '+234 813 444 5555', 'Medical Director', 'Strict NDPR compliance requirements', true),
  ('Ngozi Kalu', 'ngozi@fashionhub.ng', '+234 814 555 6666', 'Creative Director', 'Active client, fast turnaround expected', true)
ON CONFLICT DO NOTHING;

-- 4. Insert Initial Leads & Deals
INSERT INTO public.leads (name, company, email, phone, service_interested, source, budget, currency, notes, status, estimated_value, probability, expected_close_date)
VALUES 
  ('Chukwudi Abiola', 'TechVenture Nigeria', 'chukwudi@techventure.ng', '+234 810 111 2222', 'website-development', 'website', 1500000, 'NGN', 'Corporate portal with CMS', 'new-lead', 1500000, 20, CURRENT_DATE + INTERVAL '30 days'),
  ('Amina Yusuf', 'Sahara Logistics', 'amina@saharalog.com', '+234 811 222 3333', 'ecommerce-development', 'facebook-ads', 3200000, 'NGN', 'Needs e-commerce logistics supplies checkout', 'qualified', 3200000, 40, CURRENT_DATE + INTERVAL '45 days'),
  ('Olufemi Peters', 'EduFirst Academy', 'olufemi@edufirst.ng', '+234 812 333 4444', 'lms-development', 'google-ads', 5500000, 'NGN', 'LMS for 650+ students with ModeCBT integration', 'discovery-call', 5500000, 60, CURRENT_DATE + INTERVAL '20 days'),
  ('David Thompson', 'UK Trade Connect', 'david@uktrade.co.uk', '+44 20 7946 0958', 'website-development', 'website', 5200, 'GBP', 'UK-based corporate site for West Africa operations', 'negotiation', 5200, 85, CURRENT_DATE + INTERVAL '10 days'),
  ('Ngozi Kalu', 'FashionHub Lagos', 'ngozi@fashionhub.ng', '+234 814 555 6666', 'ecommerce-development', 'whatsapp', 2200000, 'NGN', 'Online fashion boutique with payment & delivery integration', 'won', 2200000, 100, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- 5. Insert Initial Hosting Accounts
INSERT INTO public.hosting_accounts (client_name, domain_name, expiry_date, hosting_plan, ssl_status, auto_renew, status, monthly_fee, currency)
VALUES 
  ('FashionHub Lagos', 'fashionhub.ng', CURRENT_DATE + INTERVAL '365 days', 'business', 'active', true, 'active', 18000, 'NGN'),
  ('TechVenture Nigeria', 'techventure.ng', CURRENT_DATE + INTERVAL '20 days', 'enterprise', 'active', true, 'active', 35000, 'NGN'),
  ('EduFirst Academy', 'edufirst.ng', CURRENT_DATE + INTERVAL '12 days', 'business', 'active', false, 'active', 18000, 'NGN'),
  ('HealthPlus Clinics', 'healthplus.ng', CURRENT_DATE + INTERVAL '60 days', 'enterprise', 'active', true, 'active', 35000, 'NGN')
ON CONFLICT DO NOTHING;

-- 6. Insert Initial Requisitions (Office Expenses)
INSERT INTO public.requisitions (receipt_number, title, description, amount, currency, category, urgency, status, staff_name, decision_notes, transaction_id, completed_at)
VALUES 
  ('REQ-2026-1042', 'AWS Cloud Server & Database Monthly Subscription', 'Production infrastructure renewal for MODE CBT & client droplets', 145000, 'NGN', 'Cloud Infrastructure', 'Urgent', 'Completed', 'Emeka Nwosu', 'Approved by MD. Essential for production stability.', 'TXN-GTB-8839219', NOW()),
  ('REQ-2026-1043', 'Quarterly Office Fiber Internet Subscription', 'Main office dedicated fiber link renewal (Swift Networks)', 85000, 'NGN', 'Office Utilities', 'High', 'Approved', 'Fatima Bello', 'Approved. Accounts to disburse via swift online portal.', NULL, NULL),
  ('REQ-2026-1044', 'Facebook Ads & Meta Campaign Budget (Q3)', 'Lead generation marketing spend targeting Nigerian education & e-commerce sectors', 250000, 'NGN', 'Marketing & Ads', 'Medium', 'Pending', 'Chioma Eze', NULL, NULL, NULL)
ON CONFLICT DO NOTHING;
