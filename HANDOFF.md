# TaskFlow Pro — Project Handoff Document

## Overview
TaskFlow Pro is a full-featured project management web application built for ThirstMetrics. It handles software development projects, beverage brand activations, marketing campaigns, and general project management with Kanban boards, calendars, team chat, file management, and an approval workflow.

**As of Feb 2026:** The app now has a full PostgreSQL persistence layer via Neon + Drizzle ORM. All data persists across page refreshes and deploys. Zustand remains as an optimistic client-side cache.

## Tech Stack
- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` syntax)
- **State:** Zustand (optimistic client cache — persists via API to database)
- **Database:** Neon PostgreSQL (serverless) via `@neondatabase/serverless`
- **ORM:** Drizzle ORM with drizzle-kit for migrations
- **Icons:** lucide-react
- **Dates:** date-fns
- **IDs:** uuid
- **Toasts:** react-hot-toast
- **Theming:** CSS custom properties via ThemeProvider (white-label capable)

## Branding
- **Primary:** ThirstMetrics teal `#0d7377`
- **Sidebar:** Dark teal `#042829`
- **Accent:** Cyan `#22d3e6`
- **Footer:** "Powered by ThirstMetrics © 2026"
- **Favicon/Logo:** Custom bar chart SVG in `/public/favicon.svg`

## Repository
- **GitHub:** https://github.com/ThirstMetrics/ProjectManager
- **Auth:** Classic PAT token (stored in git remote URL)
- **Branch:** `main` (11 commits) — Full platform with database persistence
- **Local path:** `/Users/dev01m4/Claude_TaskManager/task-manager/`

## Deployments
| Platform | URL | Status |
|----------|-----|--------|
| Vercel | https://task-manager-five-wine.vercel.app | **Live** (primary — auto-deployed on push) |
| Custom domain | projectmanager.thirstmetrics.com | DNS A record pending at Bluehost |

**Note:** Cloudways static export deployment has been **retired**. The app now uses server-rendered API routes and cannot run as a static export. Vercel is the sole deployment target.

### Vercel Environment Variables
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string (set in Vercel dashboard → Settings → Environment Variables) |

### Neon Database
- **Provider:** Neon (serverless PostgreSQL)
- **Region:** West US 3 (Azure)
- **Dashboard:** https://console.neon.tech
- **Connection string:** In `.env.local` (local) and Vercel env vars (production)
- **Tables:** 25 tables across 7 schema files
- **Migrations:** `drizzle/` directory, applied via `npm run db:migrate`

## Git History

### `main` branch
```
24e6228 feat: Add Neon PostgreSQL + Drizzle ORM persistence layer
976453c Merge pull request #1 from ThirstMetrics/feature/activations
5a1a9af feat: Complete activation module — Phases 3-8
b2df746 feat: Add Brand Activation Management module (Phases 1-2)
3131ed4 fix: Clean up dashboard task cards for mobile
649fdb3 fix: Include .htaccess in public/ so it survives rsync --delete deploys
bb7259a fix: Default sidebar to collapsed on mobile, no auto-expand on nav click
b2a763f feat: Configure static export for Cloudways deployment
5c73d58 fix: Scope team member filters to selected project
84ef24c feat: Complete TaskFlow Pro with ThirstMetrics branding
76ab69b Initial commit from Create Next App
```

## Architecture

### Data Flow
```
User Action → Zustand (instant optimistic update) → API Route → Neon PostgreSQL
                                                         ↓
                                              On error: rollback Zustand + toast.error()
```

### Hydration on Page Load
```
AppShell mount → GET /api/hydrate → fetch all 25 tables in parallel → populate Zustand store → render UI
```

### Key Architecture Decisions
1. **Optimistic updates:** Zustand mutates instantly for snappy UI. API call fires in background. On failure, Zustand rolls back and shows error toast.
2. **Single hydration endpoint:** `/api/hydrate` loads ALL data in one request (projects, tasks, milestones, team, chat, calendar, files, notifications, activations + all sub-resources). This avoids waterfall fetches.
3. **No authentication yet:** All API routes are open. Auth is the next major milestone.
4. **String-mode timestamps:** All Drizzle timestamp columns use `mode: "string"` to return ISO strings, matching existing TypeScript interfaces.
5. **JSONB for arrays:** Tags, subtasks, mentions, photos etc. stored as `jsonb` columns rather than separate tables.
6. **Pivot tables:** Task dependencies (`task_dependencies`) and document visibility (`activation_document_visibility`) use proper many-to-many pivot tables.

## Project Structure (97 source files)

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Inter font, metadata, Providers)
│   ├── providers.tsx           # ThemeProvider + Toaster wrapper
│   ├── globals.css             # Tailwind imports + CSS variable definitions
│   ├── page.tsx                # Dashboard (stats, charts, recent tasks, pending approvals)
│   ├── api/                    # ★ NEW — 30 API route files
│   │   ├── hydrate/route.ts           # GET: fetch all data for app hydration
│   │   ├── projects/route.ts          # GET, POST
│   │   ├── projects/[id]/route.ts     # GET, PATCH, DELETE
│   │   ├── tasks/route.ts             # GET, POST
│   │   ├── tasks/[id]/route.ts        # GET, PATCH, DELETE
│   │   ├── tasks/[id]/subtasks/route.ts    # POST, PATCH
│   │   ├── tasks/[id]/dependencies/route.ts # POST, DELETE
│   │   ├── tasks/[id]/approval/route.ts     # POST, PATCH
│   │   ├── milestones/route.ts        # GET, POST, PATCH, DELETE
│   │   ├── team/route.ts              # GET, POST, PATCH, DELETE
│   │   ├── activity/route.ts          # GET, POST
│   │   ├── chat/channels/route.ts     # GET, POST, DELETE
│   │   ├── chat/messages/route.ts     # GET, POST, PATCH, DELETE
│   │   ├── calendar/route.ts          # GET, POST, PATCH, DELETE
│   │   ├── files/route.ts             # GET, POST, DELETE
│   │   ├── notifications/route.ts     # GET, POST, PATCH, DELETE
│   │   ├── activations/route.ts       # GET, POST
│   │   ├── activations/[id]/route.ts  # GET, PATCH, DELETE
│   │   └── activations/[id]/         # 11 sub-resource routes
│   │       ├── venues/route.ts
│   │       ├── stakeholders/route.ts
│   │       ├── products/route.ts
│   │       ├── personnel/route.ts
│   │       ├── leads/route.ts
│   │       ├── budget/route.ts
│   │       ├── documents/route.ts
│   │       ├── checklists/route.ts
│   │       ├── issues/route.ts
│   │       ├── media/route.ts
│   │       ├── run-of-show/route.ts
│   │       └── reports/route.ts
│   ├── activations/
│   │   ├── page.tsx            # Activation list with brand/phase/budget cards
│   │   └── [id]/
│   │       ├── page.tsx                        # Dynamic route (no generateStaticParams)
│   │       └── ActivationDashboardClient.tsx    # 10-tab activation dashboard
│   ├── calendar/page.tsx       # Calendar with month view, project/member filters
│   ├── files/page.tsx          # File repository with grid/table views, FileViewer slide-in
│   ├── notifications/page.tsx  # Notification center with mark read/unread
│   ├── projects/
│   │   ├── page.tsx            # Project list with cards
│   │   └── [id]/
│   │       ├── page.tsx                  # Dynamic route (no generateStaticParams)
│   │       └── ProjectDashboardClient.tsx # Full project dashboard (5 tabs)
│   ├── settings/page.tsx       # Settings with branding + notification prefs
│   └── tasks/page.tsx          # Kanban + list view with filters
├── components/
│   ├── activation/             # All activation-specific components
│   │   ├── ActivationReportPanel.tsx
│   │   ├── BudgetOverview.tsx
│   │   ├── DocumentList.tsx
│   │   ├── ESignModal.tsx
│   │   ├── ExecutionPanel.tsx
│   │   ├── ProductInventoryTable.tsx
│   │   └── SignatureCanvas.tsx
│   ├── calendar/               # MonthView, NewEventModal, EventDetailModal
│   ├── dashboard/              # Stats components used by main dashboard
│   ├── files/                  # File-related components
│   ├── layout/
│   │   ├── AppShell.tsx        # Main shell — calls hydrate() on mount, shows spinner until ready
│   │   ├── Sidebar.tsx         # Collapsible nav + project/activation shortcuts
│   │   └── TopBar.tsx          # Top bar with search, notifications bell, user menu
│   ├── notifications/          # Notification list components
│   ├── project/
│   │   ├── ChatPanel.tsx       # Slack-style chat with channels, threads, @mentions
│   │   ├── InviteMemberModal.tsx
│   │   ├── MilestoneList.tsx
│   │   └── TeamManagement.tsx
│   ├── settings/
│   │   ├── BrandingSettings.tsx
│   │   └── NotificationSettings.tsx
│   ├── tasks/
│   │   ├── KanbanBoard.tsx
│   │   ├── NewProjectModal.tsx
│   │   ├── NewTaskModal.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskDetailModal.tsx
│   │   └── TaskListView.tsx
│   └── ui/                     # Badge, Button, Card, FileViewer, Modal, ProgressBar
├── db/                         # ★ NEW — Database layer
│   ├── index.ts                # Drizzle client singleton (Pool + schema)
│   ├── seed.ts                 # Full database seeder (all demo data)
│   └── schema/
│       ├── index.ts            # Re-exports all schema files
│       ├── core.ts             # projects, tasks, task_dependencies, milestones, team_members, activity_log
│       ├── chat.ts             # chat_channels, chat_messages
│       ├── calendar.ts         # calendar_events
│       ├── files.ts            # file_items
│       ├── notifications.ts    # notifications, notification_preferences
│       └── activations.ts      # activations + 13 child tables (all with cascade delete)
├── lib/
│   ├── api-client.ts           # ★ NEW — Typed fetch wrapper (get/post/patch/delete)
│   ├── store.ts                # Zustand store (optimistic updates + API persistence)
│   ├── types.ts                # All TypeScript interfaces
│   └── utils.ts                # Formatters, cn(), status/priority configs
└── theme/
    ├── theme.config.ts         # ThirstMetrics color palette, brand config
    └── ThemeProvider.tsx        # CSS variable injection from theme config

drizzle/                        # ★ NEW — Migration files
├── 0000_fine_maximus.sql       # Initial migration (25 tables)
└── meta/                       # Drizzle Kit metadata

drizzle.config.ts               # ★ NEW — Drizzle Kit configuration
```

## Database Schema (25 tables)

### Core (`src/db/schema/core.ts`)
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `projects` | Project management | id (varchar PK), name, description, status, priority, progress |
| `tasks` | Task tracking | id, projectId (FK → projects), title, status, priority, assignee, subtasks (jsonb) |
| `task_dependencies` | Many-to-many pivot | taskId + dependsOnId (composite PK) |
| `milestones` | Project milestones | id, projectId (FK → projects), title, dueDate, status |
| `team_members` | Team roster | id, projectId (FK → projects), name, role, email, avatar |
| `activity_log` | Audit trail | id, projectId, user, action, target, detail, timestamp |

### Chat (`src/db/schema/chat.ts`)
| Table | Purpose |
|-------|---------|
| `chat_channels` | Channels per project/activation |
| `chat_messages` | Messages with threads, reactions, @mentions |

### Calendar (`src/db/schema/calendar.ts`)
| Table | Purpose |
|-------|---------|
| `calendar_events` | Events with date, time, project association |

### Files (`src/db/schema/files.ts`)
| Table | Purpose |
|-------|---------|
| `file_items` | File metadata (no actual file storage yet) |

### Notifications (`src/db/schema/notifications.ts`)
| Table | Purpose |
|-------|---------|
| `notifications` | User notifications with read/unread state |
| `notification_preferences` | Per-category notification settings |

### Activations (`src/db/schema/activations.ts`) — 14 tables
| Table | Purpose |
|-------|---------|
| `activations` | Brand activation events |
| `activation_venues` | Venue details per activation |
| `activation_stakeholders` | Stakeholders with NDA tracking |
| `activation_products` | Product inventory lifecycle |
| `activation_personnel` | Staff with clock in/out |
| `activation_leads` | Lead capture with consent |
| `activation_budget_items` | Budget with approval workflow |
| `activation_documents` | Privacy-scoped documents |
| `activation_document_visibility` | Document → stakeholder visibility pivot |
| `activation_checklists` | Compliance/setup checklists |
| `activation_issues` | Issue tracking with severity |
| `activation_media` | Photo/video with approval |
| `activation_run_of_show` | Day-of event timeline |
| `activation_reports` | After-action ROI reports |

### Schema Conventions
- **IDs:** `varchar(64)` primary keys with prefixes (`proj-`, `task-`, `act-`, `venue-`, `stk-`, etc.)
- **Money:** `integer` (cents) — display with `formatCurrency()`
- **Arrays:** `jsonb` columns (tags, subtasks, mentions, photos, etc.)
- **Timestamps:** `timestamp` with `mode: "string"` (returns ISO strings)
- **Cascade deletes:** All child tables use `onDelete: 'cascade'` on their parent FK

## Key Features Built

### Base Platform
1. **Dashboard** — Stats cards, task distribution chart, recent tasks, upcoming deadlines, pending approvals
2. **Projects** — Project cards, full project dashboard with 5 tabs (Overview, Tasks, Team, Chat, Files)
3. **Tasks** — Kanban board + list view, filters (project, status, priority, assignee, search)
4. **Calendar** — Month view with event dots, project/member filters, new event modal
5. **Files** — Grid + table view, FileViewer slide-in panel (images, PDFs, videos), upload/delete
6. **Notifications** — Notification center with auto-generated notifications from approvals
7. **Settings** — Branding customization, notification preferences
8. **Team Management** — Member list, 4 roles (owner/admin/member/viewer), invite flow, activity log
9. **Chat** — Slack-style with channels, threaded replies, @mentions, message edit/delete
10. **Approval Workflow** — Request approval on any task, approver gets notification, approve/reject with comments
11. **White-label Theming** — Full CSS variable system, configurable from theme.config.ts
12. **Responsive Sidebar** — Collapsed on mobile, expanded on desktop, manual toggle

### Brand Activation Module (10 tabs)
13. **Activation List** — Card grid with brand, phase badge, event date, budget progress, lead goals
14. **10-Tab Activation Dashboard:** Overview, Venue, People, Products, Budget, Documents, Execution, Media, Report, Chat
15. **NDA E-Sign** — HTML5 Canvas signature (touch-enabled), consent checkbox, base64 storage
16. **Privacy Scoping** — Documents scoped per stakeholder, "View As" dropdown for admin

### Persistence Layer (NEW — Feb 2026)
17. **Neon PostgreSQL** — 25 tables, full relational schema with cascade deletes
18. **30 API Routes** — Full CRUD for all entities
19. **Optimistic Updates** — Instant UI with background API persistence and automatic rollback
20. **Single-Request Hydration** — All data loaded in one `/api/hydrate` call on mount

## npm Scripts
| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Start dev server |
| `build` | `next build` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run linter |
| `db:generate` | `drizzle-kit generate` | Generate SQL migration from schema changes |
| `db:migrate` | `drizzle-kit migrate` | Apply pending migrations to database |
| `db:seed` | `tsx src/db/seed.ts` | Seed database with demo data |
| `db:studio` | `drizzle-kit studio` | Open Drizzle Studio (visual DB browser) |

## Critical Technical Patterns
- **Zustand selectors:** Always use `useMemo` for filtered arrays to avoid infinite re-renders
- **`useSearchParams()`:** Requires `<Suspense>` boundary in Next.js 16
- **Hydration:** AppShell calls `hydrate()` on mount, shows spinner until `_hydrated === true`
- **Optimistic pattern:** Every store mutation: save prev → optimistic set() → `persist(apiCall, rollback)`
- **Filter scoping:** Assignee filters are scoped to the selected project
- **dotenv in scripts:** `drizzle.config.ts` and `seed.ts` use `config({ path: ".env.local" })` — NOT `import "dotenv/config"` (which reads `.env` only)
- **Money in cents:** All monetary values stored as integers (cents). Display with `formatCurrency()`.
- **Chat reuse for activations:** Activation ID goes into the `projectId` field on chat channels

## What Does NOT Exist Yet (Remaining Gaps)
1. **No authentication** — No login, no user sessions, no access control. All API routes are open.
2. **No real file storage** — File "uploads" create metadata in DB, but no actual blob storage (Azure Blob, S3, etc.)
3. **No real-time** — Chat is persisted but not real-time (no WebSocket/SSE). Requires page refresh to see other users' messages.
4. **No drag-and-drop** — Kanban columns use click-to-move, not true DnD
5. **No input validation** — API routes trust client input. Need server-side validation (zod).
6. **No rate limiting** — API routes have no rate limiting or abuse prevention.

## Bugs Fixed (for reference)
| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Hydrate `.where()` syntax error | Haiku agent used callback syntax instead of `eq()` | Added `import { eq } from "drizzle-orm"` and corrected syntax |
| 13 activation routes: `import { crypto }` | Invalid import — `crypto` is global in Node.js | Removed the import line from all 13 files |
| drizzle-kit "url: undefined" | `import "dotenv/config"` reads `.env` not `.env.local` | Changed to `config({ path: ".env.local" })` |
| Seed "No database host" | Same dotenv issue | Same `.env.local` explicit path fix |
| Port 3000/3001 occupied | Other projects running | Used port 3004 for development |
| Stale `.next/dev/lock` | Previous dev server didn't clean up | `rm -f .next/dev/lock` |
| 403 on Cloudways (historical) | `.htaccess` deleted by rsync | Moved to `public/` (no longer relevant — Cloudways retired) |
| Sidebar auto-expand (historical) | Default state wrong | Changed default, added viewport check |
| Filter scoping (historical) | Assignee list not scoped | `useMemo` filters by project |

## Seed Data (in database)
- **3 projects:** Mobile App Redesign, Valentine's Champagne Activation, Q1 Marketing Push
- **12 tasks** across projects with various statuses/priorities, including 2 in pending approval
- **8 milestones** with due dates and statuses
- **Team members** assigned per project with roles
- **Calendar events** with project associations
- **Chat channels** with seed messages per project
- **Files** with metadata
- **Notifications** including approval-related ones
- **2 activations:** "Valentine's Champagne Soirée" (act-1) and "T-Mobile Summer Bash" (act-2)
- **Full activation data:** venues, stakeholders, products, personnel, budget items, documents, checklists, run-of-show items

## Pending Action Items

### Completed
- [x] Neon PostgreSQL + Drizzle ORM persistence layer (25 tables)
- [x] 30 API routes for full CRUD
- [x] Zustand store migration to optimistic updates
- [x] Single-request hydration endpoint
- [x] Database migration applied + seeded
- [x] Deployed to Vercel with DATABASE_URL env var
- [x] Verified production at https://task-manager-five-wine.vercel.app
- [x] All activation module phases (1-8) complete
- [x] Merged to main, pushed to GitHub

### Next Priorities
- [ ] **Add authentication** — NextAuth.js, Clerk, or Azure AD
- [ ] **Add server-side validation** — zod schemas for all API inputs
- [ ] **Add real file storage** — Azure Blob Storage, S3, or Cloudflare R2
- [ ] **Add real-time chat** — WebSocket or SSE for live message delivery
- [ ] **Add drag-and-drop** — Kanban board DnD (dnd-kit or similar)
- [ ] **Add DNS A record** at Bluehost: `projectmanager` → Vercel
- [ ] **Plan Azure migration** — user mentioned moving to Azure

## Implementation Plan Reference
The Neon + Drizzle integration plan is stored at:
`/Users/dev01m4/.claude/plans/refactored-churning-tower.md`

The activation module implementation plan is stored at:
`/Users/dev01m4/.claude/plans/wiggly-sleeping-engelbart.md`
