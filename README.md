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
- **Database & Auth**: Supabase (PostgreSQL with RLS & real-time updates) — prepared at `supabase/schema.sql` but not yet wired up; see below.

## Current persistence (read before deploying)

Despite the target architecture above, the app does **not** currently read or write Supabase at all. The real datastore is a single JSON file, `data/mode-ops-db.json`, read/written by `src/app/api/sync/route.ts` and pushed to connected clients in real time over SSE (`src/app/api/sync/events/route.ts`). `src/lib/store.tsx` keeps a client-side IndexedDB/localStorage cache and reconciles it against that server file on load, on focus, and on every mutation.

This has one serious consequence for deployment: **that file lives on local disk inside the container.** If you deploy this without a persistent volume mounted at the path it writes to (`data/`), every redeploy starts a fresh container with no data — the app will fall back to the seed data in `src/lib/seed-data.ts` and everything added since the last deploy is gone. Before deploying:
1. Mount a persistent volume at `/app/data` (or wherever `cwd` resolves to in your container) on whatever host you deploy to.
2. Never commit `data/mode-ops-db.json` — it's gitignored for exactly this reason, and because it holds live user data (previously it was accidentally committed; that history has been purged).
3. Treat moving to real Supabase/Postgres persistence (the schema is already written) as the actual fix, not the volume — a volume just stops redeploys from being destructive, it doesn't give you backups, multi-instance scaling, or query capability.
