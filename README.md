# MODE Operations Suite (mode-ops)

A unified internal Enterprise Operating System for **MODE Digital Creations**, combining:
1. **MODE CRM**: Sales pipeline (Kanban), client projects, tasks, hosting/domain renewals, and client invoices.
2. **Office-Expense**: Staff requisitions, approval hierarchies, and expense tracking.
3. **One-Minute-Manager**: 1-minute goal setting, praise/redirect feedback, and team performance metrics.

## Reference Repositories
The original repositories have been mirrored into `_references/` for migration:
- `_references/crm`
- `_references/office-expense`
- `_references/one-minute-manager`

## Target Architecture
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (ModeCBT Royal Blue `#0D52F8` + crisp white)
- **Database & Auth**: Supabase (PostgreSQL with RLS & real-time updates)
