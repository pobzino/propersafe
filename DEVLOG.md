# Propersafe Dev Log

## 2026-06-07 — Phase 1: Internal Dashboard Foundation

### What was built

- Initialized Next.js 16 project with TypeScript, Tailwind CSS, and App Router
- Installed dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `date-fns`, `lucide-react`, `uuid`
- Created Supabase schema migration (`001_initial_schema.sql`) with tables:
  - `clients`, `professionals`, `cases`, `checks`, `documents`, `status_updates`, `reports`
- Set up Supabase client utilities (`lib/supabase/client.ts`, `server.ts`, `types.ts`)
- Created utility files for case references, check types, and status mappings
- Built internal auth flow:
  - Login page at `/login` with email/password
  - Internal layout with sidebar navigation and sign-out
  - Middleware protecting internal routes
- Built case pipeline dashboard (`/dashboard`):
  - Kanban-style view grouped by status
  - Case health indicator (green/amber/red)
  - Days elapsed, client name, location
- Built cases list (`/cases`):
  - Table view with search and status filter
  - Links to case detail
- Built case detail (`/cases/[id]`):
  - Full case record with inline editing
  - Check management (assign professional, update status, due date, findings, blocked reason)
  - Document upload to Supabase Storage with list and preview links
  - Status update log (append-only timeline)
  - Client info sidebar
  - Intake notes display
- Built create case form (`/cases/new`):
  - Client creation or lookup by email
  - Service type selector with auto-generated checks
  - All case fields
- Built professionals directory (`/professionals`):
  - Grid view of active/inactive professionals
- Created API routes:
  - `POST /api/cases` — create case with auto-ref generation and default checks
  - `PATCH /api/checks` — update check status with logging
  - `POST /api/documents` — create document record
  - `POST /api/auth/signout` — sign out and redirect

### Decisions made

- Used `force-dynamic` on internal routes because they rely on auth/cookies
- Document preview links go directly to Supabase Storage public URL
- Case reference format: `PS-YYYY-NNNN`, generated from current year case count
- No AI integration yet — following the "workflow before AI" principle
- Professionals don't have platform access in v1; they receive briefs by email/WhatsApp

### What's next

1. Run the migration against a live Supabase project
2. Seed development data
3. Test the full flow: create case → assign checks → upload documents → update statuses
4. Set up Supabase Storage bucket for documents
5. Begin Phase 2 (client portal) once the internal dashboard is manually proven

### Environment setup needed

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials.

Create the `documents` storage bucket in Supabase and make it public for internal previews.

## 2026-06-07 — Supabase project setup & seeding

### Actions taken
- Applied migration `001_initial_schema` to live Supabase project `uufgzqnphejsyjzegfzi`
- Created `documents` storage bucket (public)
- Seeded 3 professionals (Chinedu, Amina, Emeka)
- Seeded 1 sample client (Oluwaseun Adeyemi) and case PS-2026-0001
- Created 6 default checks for the validity check case
- Generated TypeScript types from live schema (`lib/supabase/generated-types.ts`)
- Updated `.env.local` with real project credentials

### Credentials configured
- `NEXT_PUBLIC_SUPABASE_URL`: https://uufgzqnphejsyjzegfzi.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (legacy anon key)
- Supabase MCP configured in `~/.kimi/mcp.json` with PAT auth

### Note
The Supabase MCP connection requires a session restart to expose tools to the AI. All database operations above were done via Management API + curl.

## 2026-06-07 — Landing page connected to Next.js backend

### Actions taken
- Created `POST /api/enquire` CORS-enabled endpoint that receives submissions from the static landing page
- Landing page form now submits via fetch to `http://localhost:3000/api/enquire`
- On submission: creates client → creates case with `enquiry_received` status → auto-generates checks → logs status update
- Returns `caseRef` to the landing page, which displays it in the success message
- Next.js root (`/`) redirects to `http://localhost:8082/` (the landing page)
- Added "Coordinator login" link in landing page nav pointing to `/login`

### Note for deployment
Before deploying, update hardcoded URLs in `propersafe-site/index.html`:
- `fetch('http://localhost:3000/api/enquire')` → production API URL
- `href="http://localhost:3000/login"` → production login URL
- `redirect("http://localhost:8082/")` in `app/page.tsx` → production landing page URL

## 2026-06-07 — Replaced landing page with newer design

### Actions taken
- Replaced the React landing page with the newer static HTML from `/Users/pobor/Downloads/propersafe/index.html`
- Copied assets: `hero-poster.jpg`, `hero-video.mp4`, `thanks.html`
- Updated form submission to POST to `/api/enquire` instead of Supabase directly
- Updated field names in JS payload to match API (`firstName`, `lastName`, `propertyLocation`)
- Added case ref display to `thanks.html` via URL param
- Added "Coordinator login" link in nav pointing to `/login`
- Restored rewrite `/` → `/landing.html` in `next.config.ts`
- Removed temporary `app/(marketing)` and `components/marketing` files

## 2026-06-07 — Phase 2: Client portal and magic link auth

### Actions taken
- Created `/client-login` — client enters email, receives Supabase magic link
- Created `/auth/callback` — exchanges magic link code for session, redirects to `/case/[ref]`
- Created `/case/[ref]` — authenticated client case view with:
  - Case status with plain-English description
  - Progress timeline (7 steps, visual tracker)
  - Document upload to Supabase Storage
  - Status update log (read-only)
  - Report viewer (shows when status is `report_delivered`)
- Added "Send magic link" button in internal case detail (coordinator can manually invite client)
- Added "Client portal" link in landing page footer
- Created and applied migration `002_client_rls_by_email` — updated RLS policies to match clients by email instead of UUID
- Updated `app/api/enquire` to remove CORS (same-origin after landing page unification)

### Routes
| Route | Purpose |
|-------|---------|
| `/client-login` | Client requests magic link |
| `/auth/callback` | Magic link verification + redirect |
| `/case/PS-2026-XXXX` | Client case portal |

### To test
1. Submit enquiry on landing page
2. Go to `/login`, open case detail
3. Click "Magic link" button in client info panel
4. Check email (Supabase logs) for magic link
5. Click link → should land on `/case/[ref]` authenticated
6. Upload documents, view status, see report when delivered
