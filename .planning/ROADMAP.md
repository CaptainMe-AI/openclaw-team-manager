# Roadmap: OpenClaw Team Manager

## Overview

Build a local mission control dashboard for managing OpenClaw AI agents. The build follows a strict dependency order: Rails foundation with auth and database, then a dark-mode design system and app shell, then the mock data pipeline (models, API, React hooks), then each screen in dependency order (Agent Fleet, Task Board, Approvals, Usage, Dashboard Overview as the integration layer, Settings last). Every screen consumes mock data through a service abstraction designed for future Gateway swap.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Rails app, PostgreSQL, Devise auth, Vite + React, test framework
- [ ] **Phase 2: Design System** - Dark theme tokens, typography, reusable component library, responsive breakpoints
- [ ] **Phase 3: App Shell** - Sidebar navigation, top bar, routing for all sections
- [ ] **Phase 4: Data Layer** - Database schema, mock data service, REST API, React state management
- [ ] **Phase 5: Agent Fleet** - Agent grid/table views with filters, status indicators, context menus
- [ ] **Phase 6: Task Board** - Kanban columns with drag-and-drop, task cards, create new task modal
- [ ] **Phase 7: Approvals** - Pending queue with approve/deny, agent reasoning, history tab
- [ ] **Phase 8: Usage & Cost** - KPI cards, token/cost/latency charts, time selector, export
- [ ] **Phase 9: Dashboard Overview** - KPI cards, activity timeline, recent tasks, action required sidebar
- [ ] **Phase 10: Settings** - General, agents, notifications, data sources tabs with save/discard

## Phase Details

### Phase 1: Foundation
**Goal**: A running Rails + React application with authentication, database, and dev tooling that all subsequent phases build on
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07, FOUN-08, FOUN-09, FOUN-10
**Success Criteria** (what must be TRUE):
  1. Running `bin/dev` starts both Rails server and Vite dev server, and the app loads in a browser
  2. User can log in with email/password (seeded via console), and the session persists across page refresh
  3. PostgreSQL is running in Docker via `setup/` scripts, and all models use UUID primary keys
  4. RSpec test suite runs and passes with at least one model and one request spec
  5. RuboCop runs clean on the generated codebase
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md -- Rails 8 app generation, PostgreSQL connection, UUID primary keys
- [x] 01-02-PLAN.md -- Devise auth, Vite + React + Tailwind v4, bin/dev
- [x] 01-03-PLAN.md -- RSpec, RuboCop, AnnotateRb, Playwright test framework

### Phase 2: Design System
**Goal**: A dark-mode component library and theme tokens that all screens share, preventing visual divergence
**Depends on**: Phase 1
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04
**Success Criteria** (what must be TRUE):
  1. App renders with dark background (#0f1219), surface panels (#1a1f2e), and teal accent (#00d4aa) throughout -- no white flashes
  2. Inter font renders for UI text and JetBrains Mono renders for data/metric values
  3. Reusable components (Card, Badge, Button, Table, Input, StatusDot) render correctly in isolation and respond to props
  4. Layout adapts across mobile (<640px), tablet (640-1024px), and desktop (>1024px) breakpoints
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [x] 02-01-PLAN.md -- Theme tokens, typography, cn() utility, Vite path alias, CSS utilities
- [x] 02-02-PLAN.md -- StatusDot, Badge, Card, Button components
- [x] 02-03-PLAN.md -- Input, Table components, barrel export, demo page, E2E test stubs

### Phase 3: App Shell
**Goal**: Persistent navigation chrome that wraps all screens, with routing to every section
**Depends on**: Phase 2
**Requirements**: SHEL-01, SHEL-02, SHEL-03, SHEL-04, SHEL-05
**Success Criteria** (what must be TRUE):
  1. Sidebar shows navigation links for all 6 sections with icons, and the active section has a teal left-border indicator
  2. Top bar displays breadcrumbs and a search input that focuses when pressing '/'
  3. Notification bell displays with unread dot indicator, and user avatar shows an account dropdown on click
  4. Clicking any sidebar link navigates to the correct route without full page reload, showing a placeholder for unbuilt screens
  5. Sidebar collapses on mobile and expands on desktop
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 03-01-PLAN.md -- Routing infrastructure, PlaceholderSkeleton, 6 placeholder pages
- [x] 03-02-PLAN.md -- Sidebar navigation, TopBar, UserMenu dropdown, AppShell layout

### Phase 4: Data Layer
**Goal**: Complete data pipeline from database seeds through API endpoints to React hooks, with mock data service abstraction
**Depends on**: Phase 3
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
  1. Database has models for agents, tasks, approvals, usage records, and settings, with seed data generated by Faker
  2. All `/api/v1/` endpoints return JSON via jbuilder for agents, tasks, approvals, usage, dashboard, and settings
  3. Controllers call service objects (not models directly), and the service interface is documented for future Gateway swap
  4. React hooks (useAgents, useTasks, useApprovals, useUsage, useDashboard, useSettings) fetch from API using TanStack Query
  5. Zustand stores manage UI-only state (sidebar collapse, view toggles, filters) separately from server state
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md -- Database models, migrations, factories, model specs, Pagy config, seed data
- [x] 04-02-PLAN.md -- Service layer, API controllers, jbuilder views, routes, request specs
- [ ] 04-03-PLAN.md -- React data layer: TanStack Query hooks, TypeScript types, Zustand stores

### Phase 5: Agent Fleet
**Goal**: Operators can view all agents with status, performance data, and quick actions
**Depends on**: Phase 4
**Requirements**: AGNT-01, AGNT-02, AGNT-03, AGNT-04, AGNT-05, AGNT-06
**Success Criteria** (what must be TRUE):
  1. Grid view shows agent cards with icon, name, ID, status badge, current task, uptime, and token usage sparkline
  2. Table view shows sortable columns for name, ID, status, model, task, uptime, and tokens
  3. User can toggle between grid and table views, and filter agents by status and model
  4. Context menu on each agent card offers restart, view logs, and disable actions
  5. Disabled agents render at reduced opacity and error agents show a red border
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Task Board
**Goal**: Operators can manage tasks through a Kanban board with drag-and-drop and create new tasks
**Depends on**: Phase 4
**Requirements**: TASK-01, TASK-02, TASK-03, TASK-04, TASK-05, TASK-06, TASK-07, NTSK-01, NTSK-02, NTSK-03, NTSK-04
**Success Criteria** (what must be TRUE):
  1. Kanban board displays 6 columns (Backlog, Queued, In Progress, Awaiting Approval, Completed, Failed) populated with task cards
  2. Task cards show priority color border, task ID, priority badge, title, description (2-line clamp), agent, and timestamp
  3. User can drag cards between columns using dnd-kit, and the board updates the task status accordingly
  4. User can toggle between board and list views, and filter by agent, priority, and time period
  5. Clicking "New Task" opens a modal with task name, agent dropdown, description, priority selector, and attachment area, with form validation
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Approvals
**Goal**: Operators can review, approve, or deny pending agent actions with full context and reasoning
**Depends on**: Phase 4
**Requirements**: APPR-01, APPR-02, APPR-03, APPR-04, APPR-05, APPR-06, APPR-07
**Success Criteria** (what must be TRUE):
  1. Pending tab shows expandable approval cards with priority badge, title, time waiting, agent, target, and description
  2. User can approve (green) or deny (red) individual approvals inline, and use "Approve All" for batch action
  3. Expanding a card shows agent reasoning on the left and related context (commit/task links) on the right
  4. User can filter by risk level and sort by time waiting
  5. History tab shows a table of past decisions with timestamp, agent, action, decision badge, and decided-by
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: Usage & Cost
**Goal**: Operators can monitor token usage, API costs, and latency across their agent fleet
**Depends on**: Phase 4
**Requirements**: USAG-01, USAG-02, USAG-03, USAG-04, USAG-05, USAG-06, USAG-07
**Success Criteria** (what must be TRUE):
  1. KPI cards show total tokens, total API calls, estimated cost, and average latency with trend indicators
  2. Stacked area chart shows token usage over time per agent, and donut chart shows cost breakdown by agent
  3. Horizontal bar chart shows API calls by endpoint, and histogram shows latency distribution
  4. User can switch time periods (1h, 6h, 24h, 7d, 30d) and all charts update accordingly
  5. Export button generates a report (CSV/PDF) of the current view
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

### Phase 9: Dashboard Overview
**Goal**: Operators see a single-screen summary of fleet health, recent activity, and items needing attention
**Depends on**: Phase 5, Phase 6, Phase 7, Phase 8
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06
**Success Criteria** (what must be TRUE):
  1. KPI cards show active agents count, tasks in progress, pending approvals, and tokens used (24h) with trend indicators
  2. Agent activity timeline displays color-coded event dots (green/blue/amber/red) with hover tooltips
  3. Recent tasks table shows 5 expandable rows with task name, agent, status badge, duration, and timestamp
  4. Action required sidebar shows top pending approvals with inline approve/deny buttons that work
  5. Time period selector changes the dashboard scope, and "New Task" button opens the create task modal
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

### Phase 10: Settings
**Goal**: Operators can configure application preferences, agent policies, notifications, and data source connections
**Depends on**: Phase 4
**Requirements**: SETT-01, SETT-02, SETT-03, SETT-04, SETT-05, SETT-06
**Success Criteria** (what must be TRUE):
  1. Left sidebar tab navigation switches between General, Agents, Notifications, and Data Sources tabs
  2. General tab allows editing display name, timezone, and dashboard refresh interval
  3. Agents tab allows setting default budget, auto-restart toggle, and global allowed tools
  4. Notifications tab allows configuring alert thresholds for budget, failures, approval timeout, and agent offline
  5. Save Configuration persists changes and Discard Changes reverts to last saved state
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 > 2 > 3 > 4 > 5 > 6 > 7 > 8 > 9 > 10
Note: Phases 5, 6, 7, 8, 10 all depend on Phase 4 and could theoretically run in parallel, but execute sequentially: 5 > 6 > 7 > 8 > 9 > 10.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | - |
| 2. Design System | 0/3 | In Progress | - |
| 3. App Shell | 0/2 | Not started | - |
| 4. Data Layer | 0/3 | Not started | - |
| 5. Agent Fleet | 0/0 | Not started | - |
| 6. Task Board | 0/0 | Not started | - |
| 7. Approvals | 0/0 | Not started | - |
| 8. Usage & Cost | 0/0 | Not started | - |
| 9. Dashboard Overview | 0/0 | Not started | - |
| 10. Settings | 0/0 | Not started | - |
