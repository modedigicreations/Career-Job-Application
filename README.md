# MODE CRM

A comprehensive CRM (Customer Relationship Management) system built for MODE Digital Creations. Full-stack application with React frontend and Node.js/Express backend.

## Features

- **Authentication** — Real per-account login (bcrypt-verified passwords, JWT sessions); no account can log into another's; full login history is recorded per user
- **Roles** — Super Admin > Admin > Manager (department head) > Sales/Support/Developer, enforced server-side. Managers and above can assign tasks to others and provision new staff accounts; everyone else can only self-assign
- **Lead Management** — Capture and track leads from multiple sources (Website, Facebook Ads, Google Ads, WhatsApp, Manual, CSV Import, Referral), including contact designation and address, with edit/delete
- **Sales Pipeline** — Kanban board with drag-and-drop through 8 stages (New Lead → Won/Lost) with multi-currency support
- **Contact & Company Management** — Organize business relationships with search and CSV export
- **Project Management** — Track projects with task checklists, progress tracking, inline edit/delete; task assignment to others is restricted to managers/admins
- **One Minute Manager** — Personal goals (self-only, never assignable to others) plus manager-assigned tasks the assignee can update but not reassign; daily end-of-shift notes feed into the weekly shift report
- **Weekly Shift Reports** — Generate a PDF for any week combining task/call/email stats with that week's daily notes
- **Requisitions** — Staff submit expense requisitions; managers/admins approve or reject them
- **Financial Dashboard (Super Admin only)** — Revenue (payments received) vs. expenses (approved requisitions), broken down by day/month with quarter/year roll-ups, for profit/loss visibility
- **WhatsApp Broadcast** — Send a message to any phone number (or selected leads/contacts) via a WATI integration configured in Settings
- **Hosting & Domain Management** — Monitor domains, SSL, hosting plans with expiry reminders (90/30/7/1 day alerts) and a one-click renewal confirmation
- **Invoice & Payment Module** — Generate invoices with auto-numbering, record payments, track outstanding balances (NGN, GBP, USD)
- **Staff Performance Dashboard** — KPIs: leads generated, calls, emails, deals won, revenue
- **Service Catalog** — 10 service offerings with pricing and features
- **Support Tickets** — Client ticket management with priority levels
- **Email Campaigns** — Lead nurture and hosting renewal automation sequences
- **Global Search** — Search across leads, contacts, projects, invoices, tickets, and hosting
- **Notifications** — Real-time alerts for expiring domains, overdue invoices, urgent tickets
- **Toast Notifications** — Instant feedback on all CRUD operations
- **Settings** — Profile, company profile, team management (add staff, change roles, view login history), notification preferences, WhatsApp integration

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand (in-memory cache backed by the API — not localStorage) |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma ORM |
| Auth | JWT + bcrypt |
| PDF generation | PDFKit |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

The frontend talks to a real backend for all data — there is no offline/demo mode. Start the backend first, then the frontend.

### Backend API

```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts   # seed demo data
npm run dev
```

API runs at `http://localhost:3000`.

### Frontend

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` — log in with one of the seeded accounts below and its real password. The frontend proxies `/api` requests to the backend.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create a staff account (manager-tier only) |
| POST | /api/auth/login | Login, receive JWT, records login history |
| GET | /api/auth/me | Current user profile |
| GET | /api/auth/login-history | Login history (own, or any user's for admin/super-admin) |
| GET/PATCH | /api/users | List staff / update profile, role, active status |
| GET/POST/PUT/DELETE | /api/leads | Lead CRUD (incl. designation/address) |
| GET/POST/PUT/DELETE | /api/contacts | Contact CRUD |
| GET/POST/PUT/DELETE | /api/companies | Company CRUD |
| GET/POST/PUT/DELETE | /api/projects | Project CRUD |
| GET/POST/PUT/DELETE | /api/tasks | Project task CRUD — assigning to someone else requires manager tier |
| GET/POST/PUT/DELETE | /api/services | Service catalog CRUD |
| GET/POST/PUT/DELETE | /api/hosting | Hosting account CRUD (renewal = PUT with a new expiryDate) |
| GET/POST/PUT/DELETE | /api/invoices | Invoice CRUD |
| GET/POST | /api/payments | Payment recording |
| GET/POST/PUT/DELETE | /api/tickets | Support ticket management |
| GET/POST | /api/activities | Activity log |
| GET/POST/PUT/DELETE | /api/campaigns | Email campaign management |
| GET/POST/PUT/DELETE | /api/goals | Personal goals — strictly self-owned |
| GET/POST/PUT/DELETE | /api/manager-tasks | One Minute Manager tasks — manager tier assigns, assignee can only update status |
| GET/POST | /api/daily-summaries | Daily end-of-shift notes (one per user per day) |
| GET | /api/reports/shift-report | Generates the weekly shift-report PDF |
| GET/POST/PATCH/DELETE | /api/requisitions | Requisition submit/approve/reject |
| GET/PUT | /api/settings/integrations | WATI base URL/API key (admin/super-admin only) |
| POST | /api/whatsapp/broadcast | Send a WhatsApp broadcast via WATI |
| GET | /api/dashboard/stats | Dashboard statistics |
| GET | /api/dashboard/pipeline | Pipeline breakdown |
| GET | /api/dashboard/financials | Revenue/expense/profit breakdown (super-admin only) |

## Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components by feature
│   │   │   ├── layout/        # Sidebar, Header, Layout
│   │   │   └── ui/            # Shared components (Modal, StatCard, etc.)
│   │   ├── pages/             # Page components
│   │   ├── store/             # Zustand state management
│   │   ├── types/             # TypeScript type definitions
│   │   └── lib/               # Utilities and seed data
│   └── ...
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   └── middleware/        # Auth middleware
│   └── prisma/
│       ├── schema.prisma      # Database schema
│       └── seed.ts            # Database seeder
└── ...
```

## Default Login (Seeded)

All seeded users use password: `password123`

| Email | Role |
|---|---|
| admin@modedigitalcreations.ng | Super Admin |
| adewale@modedigital.ng | Admin |
| chioma@modedigital.ng | Sales |
| emeka@modedigital.ng | Developer |
| fatima@modedigital.ng | Manager |
| ibrahim@modedigital.ng | Support |

New staff accounts are provisioned by an admin/super-admin from Settings → Team (or `POST /api/auth/register` with an admin's token) — there is no public self-registration.

## License

Proprietary — MODE Digital Creations
