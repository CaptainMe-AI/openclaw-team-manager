# Phase 4: Data Layer - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete data pipeline from database to React components. Database models for agents, tasks, approvals, usage records, and settings. Seed data with Faker for realistic mock environment. REST API endpoints under /api/v1/ with jbuilder. React hooks with TanStack Query for server state and Zustand for UI state. Per-resource service objects as abstraction layer for future Gateway swap.

</domain>

<decisions>
## Implementation Decisions

### Schema Design — Agent Model
- **D-01:** Full agent record with dedicated columns: name, agent_id (external ID), status (enum: active/idle/error/disabled), model_name, workspace, uptime_since timestamp
- **D-02:** UUID primary keys (carried from Phase 1, D-03)
- **D-03:** Agent has_many :tasks, :approvals, :usage_records — token usage derived from UsageRecord aggregation, not stored on agent

### Schema Design — Task Model
- **D-04:** String enum status column mapping 1:1 to Kanban columns: backlog, queued, in_progress, awaiting_approval, completed, failed
- **D-05:** Priority as integer (0=P0 critical, 1=P1 high, 2=P2 medium, 3=P3 low)
- **D-06:** Display ID field (task_id string like "TASK-001") for human-readable references
- **D-07:** Title (string) + description (text) + agent_id (FK)

### Schema Design — Approval Model
- **D-08:** Single table with approval_type enum: dangerous_command, sensitive_data, budget_override (no STI)
- **D-09:** Status enum: pending, approved, denied
- **D-10:** Risk level enum: low, medium, high, critical
- **D-11:** JSONB context column for type-specific details (command text, file path, budget amount)
- **D-12:** requested_at, resolved_at timestamps + resolved_by_id FK to users

### Schema Design — Usage Records
- **D-13:** Granular UsageRecord per agent per time bucket (hourly): input_tokens, output_tokens, api_calls, cost_cents (integer), model_name, recorded_at
- **D-14:** Dashboard charts aggregate via SQL GROUP BY for time series — no pre-aggregated summary tables

### Schema Design — Settings
- **D-15:** Key-value Setting model with key (string, unique index) + value (jsonb)
- **D-16:** Keys use dot notation: "notifications.email", "budget.monthly_limit", "theme"

### Service Layer Pattern
- **D-17:** Per-resource service objects: AgentService, TaskService, ApprovalService, UsageService in app/services/
- **D-18:** Controllers call service methods, never touch models directly — enables clean Gateway swap later
- **D-19:** Service classes wrap ActiveRecord queries now; internals swappable without changing controller interface

### Seed Data
- **D-20:** Busy fleet: 6 agents (3 active, 1 idle, 1 error, 1 disabled), ~35 tasks across all Kanban columns, ~12 approvals (5 pending, 4 approved, 3 denied), 7 days of hourly usage data (~1,008 usage records)
- **D-21:** OpenClaw-themed realistic names: agents like "docs-writer", "code-reviewer", "test-runner"; tasks like "Refactor auth middleware to use JWT"; approvals like "rm -rf /tmp/build-cache" (dangerous_command)
- **D-22:** Usage records vary by agent — active agents have higher token counts, error agent has usage drop-off

### API Design
- **D-23:** REST endpoints under /api/v1/ namespace with jbuilder views
- **D-24:** Full filtering on list endpoints: status, agent_id, priority, approval_type, risk_level via query params
- **D-25:** Pagy pagination on all list endpoints (?page=1&per_page=25)
- **D-26:** Sort support: ?sort=created_at&dir=desc
- **D-27:** Usage endpoint supports date range (?from=&to=) and granularity (?granularity=hourly|daily)
- **D-28:** Flat response shape with foreign key IDs — denormalized convenience fields (e.g., agent_name on task) but no nested full associations
- **D-29:** Approve/deny actions on approvals endpoint (PATCH /api/v1/approvals/:id/approve, /deny)

### React Data Layer
- **D-30:** TanStack Query for all server state (fetching, caching, refetching). Must install @tanstack/react-query.
- **D-31:** Custom hooks per resource: useAgents, useTasks, useApprovals, useUsage, useSettings
- **D-32:** Zustand stores for UI-only state (sidebar collapse, active filters, selected time range) — already installed

### Claude's Discretion
- Exact jbuilder view structure and partials
- React Query cache/stale time configuration
- Zustand store organization (single store vs per-concern)
- Service method signatures beyond list/find/create/update
- Database index strategy

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data model and UI requirements
- `designs/TEAM_MANAGER_SPEC.md` — Feature-level spec with data fields per screen, KPI card definitions, Kanban column names, approval types, usage chart requirements
- `designs/TEAM_MANAGER_SPEC.md` §1.2 — KPI card fields (active agents, tasks in progress, pending approvals, tokens used)
- `designs/TEAM_MANAGER_SPEC.md` §2 — Agent list fields and detail view data
- `designs/TEAM_MANAGER_SPEC.md` §3 — Task board columns and card fields
- `designs/TEAM_MANAGER_SPEC.md` §4 — Usage charts, token consumption, cost breakdown, API call counts
- `designs/TEAM_MANAGER_SPEC.md` §5 — Approval types, risk levels, approval workflow
- `designs/TEAM_MANAGER_SPEC.md` §7 — Settings tabs and configuration fields

### Technology constraints
- `CLAUDE.md` — Tech stack, jbuilder constraint, testing requirements, recommended libraries with versions

### Existing codebase
- `source/dashboard/app/models/user.rb` — Existing User model (Devise auth, UUID PK) — new models follow same pattern
- `source/dashboard/config/routes.rb` — Current routes (Devise + SPA catch-all) — API namespace to be added
- `source/dashboard/app/frontend/router.tsx` — React routes for 6 pages — hooks will feed data to these page components
- `source/dashboard/db/structure.sql` — Current schema with users table — migrations extend this

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- User model with UUID primary key and Devise auth — pattern for all new models
- ApplicationRecord base class — new models inherit from this
- React Router with 6 page routes already configured — hooks connect to these pages
- Zustand already installed (v5.0.12) — ready for UI state stores
- cn() utility (clsx + tailwind-merge) — available for any new components

### Established Patterns
- UUID primary keys on all models (Phase 1 decision, D-03)
- structure.sql format for schema dumps (Phase 1 decision, D-06)
- Vite + vite_rails for frontend build pipeline
- Font Awesome icons for UI elements
- Design tokens in Tailwind CSS custom properties

### Integration Points
- API controllers mount under /api/v1/ namespace in routes.rb alongside existing Devise and SPA routes
- React Query hooks will be consumed by existing page components (DashboardPage, AgentsPage, etc.)
- Service objects sit between controllers and models — controllers in app/controllers/api/v1/
- Seed data runs via `rails db:seed` using existing PostgreSQL Docker setup (port 5411)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

- ActionCable WebSocket channels for real-time agent updates — Phase 5+ (real-time layer)
- Global search via pg_search — separate phase
- Optimistic updates for approve/deny — can be layered on in UI feature phases
- Task drag-and-drop reordering within Kanban columns — UI interaction in Task Board phase

</deferred>

---

*Phase: 04-data-layer*
*Context gathered: 2026-03-26*
