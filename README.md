# MODE CRM

A comprehensive CRM (Customer Relationship Management) system built for MODE Digital Creations. Full-stack application with React frontend and Node.js/Express backend.

## Features

- **Authentication** — Login gate with user authentication and session persistence
- **Lead Management** — Capture and track leads from multiple sources (Website, Facebook Ads, Google Ads, WhatsApp, Manual, CSV Import, Referral)
- **Sales Pipeline** — Kanban board with drag-and-drop through 8 stages (New Lead → Won/Lost) with multi-currency support
- **Contact & Company Management** — Organize business relationships with search and CSV export
- **Project Management** — Track projects with task checklists, progress tracking, inline edit/delete
- **Hosting & Domain Management** — Monitor domains, SSL, hosting plans with expiry reminders (90/30/7/1 day alerts)
- **Invoice & Payment Module** — Generate invoices with auto-numbering, record payments, track outstanding balances (NGN, GBP, USD)
- **Staff Performance Dashboard** — KPIs: leads generated, calls, emails, deals won, revenue
- **Service Catalog** — 10 service offerings with pricing and features
- **Support Tickets** — Client ticket management with priority levels
- **Email Campaigns** — Lead nurture and hosting renewal automation sequences
- **Global Search** — Search across leads, contacts, projects, invoices, tickets, and hosting
- **Notifications** — Real-time alerts for expiring domains, overdue invoices, urgent tickets
- **Toast Notifications** — Instant feedback on all CRUD operations
- **Settings** — Company profile, team management, notification preferences, data reset

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand (persisted to localStorage) |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma ORM |
| Auth | JWT + bcrypt |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Frontend (runs standalone with demo data)

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` — log in with any demo account email and any password (4+ characters).

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

API runs at `http://localhost:3000`. The frontend proxies `/api` requests to the backend when both are running.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login, receive JWT |
| GET | /api/auth/me | Current user profile |
| GET/POST/PUT/DELETE | /api/leads | Lead CRUD |
| GET/POST/PUT/DELETE | /api/contacts | Contact CRUD |
| GET/POST/PUT/DELETE | /api/companies | Company CRUD |
| GET/POST/PUT/DELETE | /api/projects | Project CRUD |
| GET/POST/PUT/DELETE | /api/tasks | Task CRUD |
| GET/POST/PUT/DELETE | /api/services | Service catalog CRUD |
| GET/POST/PUT/DELETE | /api/hosting | Hosting account CRUD |
| GET | /api/hosting/expiring | Accounts expiring within 90 days |
| GET/POST/PUT/DELETE | /api/invoices | Invoice CRUD |
| GET/POST | /api/payments | Payment recording |
| GET/POST/PUT/DELETE | /api/tickets | Support ticket management |
| GET/POST | /api/activities | Activity log |
| GET/POST/PUT/DELETE | /api/campaigns | Email campaign management |
| GET | /api/dashboard/stats | Dashboard statistics |
| GET | /api/dashboard/pipeline | Pipeline breakdown |

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
| adewale@modedigital.ng | Admin |
| chioma@modedigital.ng | Sales |
| emeka@modedigital.ng | Developer |
| fatima@modedigital.ng | Manager |
| ibrahim@modedigital.ng | Support |

## License

Proprietary — MODE Digital Creations
