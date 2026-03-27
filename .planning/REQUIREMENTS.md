# Requirements: OpenClaw Team Manager

**Defined:** 2026-03-25
**Core Value:** Operators can see and control their entire OpenClaw agent fleet from a single dashboard

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: Rails app scaffolded in `source/dashboard` using Rails generators and commands
- [x] **FOUN-02**: PostgreSQL configured with UUID as primary key for all models
- [x] **FOUN-03**: Devise authentication with session-based login (user created via console)
- [x] **FOUN-04**: vite_rails serving React frontend with Tailwind v4 CSS-first config
- [x] **FOUN-05**: `bin/dev` runs Rails server + Vite dev server together (Procfile.dev)
- [x] **FOUN-06**: Docker-based PostgreSQL via `setup/Dockerfile-local-services.yml`
- [x] **FOUN-07**: RSpec + Factory Bot + Faker test framework configured
- [x] **FOUN-08**: RuboCop linting configured
- [x] **FOUN-09**: Annotate gem configured for model schema annotations
- [x] **FOUN-10**: Playwright with cypress-on-rails for integration testing

### Design System

- [x] **DSGN-01**: Dark theme with spec color tokens (background #0f1219, surface #1a1f2e, accent #00d4aa, etc.)
- [x] **DSGN-02**: Typography system — Inter for UI text, JetBrains Mono for data/metrics
- [x] **DSGN-03**: Reusable component library: cards, badges, buttons, tables, inputs, status dots, sparklines
- [x] **DSGN-04**: Responsive breakpoints — mobile (<640px), tablet (640-1024px), desktop (>1024px)

### App Shell

- [x] **SHEL-01**: Persistent sidebar navigation with icons, labels, active state (teal left-border), collapsible on mobile
- [x] **SHEL-02**: Top navigation bar with breadcrumbs and global search input (placeholder, `'/'` to focus)
- [x] **SHEL-03**: Notification bell with unread dot indicator
- [x] **SHEL-04**: User avatar with account dropdown
- [x] **SHEL-05**: React Router with routes for all 6 sections (Dashboard, Agents, Tasks, Usage, Approvals, Settings)

### Data Layer

- [x] **DATA-01**: Mock data service abstraction — controllers call service objects, swappable for real Gateway later
- [x] **DATA-02**: Seed data with realistic agents, tasks, approvals, and usage metrics (Faker-generated)
- [x] **DATA-03**: REST API endpoints under `/api/v1/` with jbuilder serialization for all resources
- [x] **DATA-04**: React state management — TanStack Query for server state, Zustand for UI state
- [x] **DATA-05**: Database schema with models for agents, tasks, approvals, usage records, settings

### Dashboard

- [ ] **DASH-01**: KPI cards — active agents count, tasks in progress, pending approvals, tokens used (24h) with trend indicators
- [ ] **DASH-02**: Agent activity timeline — horizontal timeline with color-coded event dots (green/blue/amber/red), hover tooltips
- [ ] **DASH-03**: Recent tasks table — 5 rows, expandable, columns: task name, agent, status badge, duration, timestamp
- [ ] **DASH-04**: Action required sidebar — top pending approvals with inline approve/deny buttons
- [ ] **DASH-05**: Time period selector dropdown (default: Last 24 Hours)
- [ ] **DASH-06**: "New Task" button opening Create New Task modal

### Agent Fleet

- [x] **AGNT-01**: Grid view with agent cards — icon, name, ID, status badge, current task, uptime, token usage sparkline, context menu
- [x] **AGNT-02**: Table view with sortable columns — name, ID, status, model, task, uptime, tokens (7d)
- [ ] **AGNT-03**: View toggle between grid and table
- [x] **AGNT-04**: Filters bar — status (All/Active/Idle/Disabled), model (All/Opus/Sonnet), uptime threshold
- [ ] **AGNT-05**: Context menu actions — restart, view logs, disable (danger)
- [ ] **AGNT-06**: Disabled agents render at reduced opacity, error agents show red border

### Task Board

- [ ] **TASK-01**: Kanban columns — Backlog, Queued, In Progress, Awaiting Approval, Completed, Failed
- [ ] **TASK-02**: Task cards — left border priority color, task ID, priority badge, title, description (2-line clamp), agent, timestamp
- [ ] **TASK-03**: Drag-and-drop cards between columns using dnd-kit
- [ ] **TASK-04**: Priority system — P0 (red), P1 (amber), P2 (blue), P3 (gray)
- [ ] **TASK-05**: Board/List view toggle
- [ ] **TASK-06**: Filters bar — agent, priority, time period
- [ ] **TASK-07**: Priority legend display

### Create New Task

- [ ] **NTSK-01**: Modal dialog with fields: task name, agent dropdown, description textarea, priority button group
- [ ] **NTSK-02**: Attachment/file upload area with drag-and-drop
- [ ] **NTSK-03**: Form validation — required fields (name, agent, description, priority), cancel/create actions
- [ ] **NTSK-04**: Default priority set to Medium

### Approvals

- [ ] **APPR-01**: Pending tab with expandable approval cards — priority badge, title, time waiting, agent, target, description
- [ ] **APPR-02**: Inline approve (green) and deny (red) buttons per card
- [ ] **APPR-03**: Expanded detail panel — agent reasoning (left), related context with commit/task links (right)
- [ ] **APPR-04**: Risk level filter dropdown and time waiting sort
- [ ] **APPR-05**: History tab — table with timestamp, agent, action, decision badge, decided by
- [ ] **APPR-06**: "Approve All" batch action button
- [ ] **APPR-07**: Three approval types unified in one queue: production deployment, budget override, tool access request

### Usage & Cost

- [ ] **USAG-01**: KPI cards — total tokens, total API calls, estimated cost, avg latency with trends
- [ ] **USAG-02**: Token usage over time — stacked area chart, one series per agent
- [ ] **USAG-03**: Cost breakdown by agent — donut/pie chart
- [ ] **USAG-04**: API calls by endpoint — horizontal bar chart
- [ ] **USAG-05**: Latency distribution — histogram
- [ ] **USAG-06**: Time period selector button group (1h/6h/24h/7d/30d)
- [ ] **USAG-07**: Export report button (CSV/PDF)

### Settings

- [ ] **SETT-01**: General tab — display name, timezone dropdown, dashboard refresh interval
- [ ] **SETT-02**: Agents tab — default budget, auto-restart toggle, global allowed tools multi-select
- [ ] **SETT-03**: Notifications tab — alert thresholds for budget, failures, approval timeout, agent offline
- [ ] **SETT-04**: Data Sources tab — Gateway WebSocket URL, auth token, OpenClaw home directory, session path, refresh interval
- [ ] **SETT-05**: Save Configuration / Discard Changes actions
- [ ] **SETT-06**: Left sidebar tab navigation (General, Agents, Notifications, Data Sources)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Gateway Integration

- **GATE-01**: WebSocket connection to OpenClaw Gateway for real-time presence and agent lifecycle events
- **GATE-02**: Task dispatch — send `agent` RPC to Gateway when creating tasks
- **GATE-03**: Approval actions — send `agent.approve` RPC for approve/deny decisions
- **GATE-04**: JSONL session file parsing for real token usage data

### Enhanced Features

- **ENHN-01**: Live approval push notifications via ActionCable
- **ENHN-02**: Budget-triggered automatic approval creation at spend thresholds
- **ENHN-03**: Agent actions (restart, disable) via Gateway commands
- **ENHN-04**: Session transcript replay viewer
- **ENHN-05**: Global search across agents, tasks, approvals with keyboard shortcut

## Out of Scope

| Feature | Reason |
|---------|--------|
| User registration/signup UI | Users created via Rails console only -- local tool |
| Email delivery (verification, password reset) | No email infrastructure for local tool |
| Mobile native app | Web with responsive layout is sufficient |
| Multi-tenancy / RBAC | Single local installation, single operator |
| LLM evaluation/scoring | Separate product category -- use LangSmith/Langfuse |
| Prompt management/versioning | OpenClaw uses filesystem (IDENTITY.md, ROLE.md) as source of truth |
| Plugin/extension system | Premature for v1, constrains internal refactoring |
| AI-powered insights | Meta-complexity -- surface raw data well instead |
| Real-time WebSocket for all data | Mock data first; polling sufficient for v1 |
| Slack/webhook external notifications | No external notification channels in v1 |
| Custom/configurable dashboard layouts | Fixed layouts per design spec in v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| FOUN-05 | Phase 1 | Complete |
| FOUN-06 | Phase 1 | Complete |
| FOUN-07 | Phase 1 | Complete |
| FOUN-08 | Phase 1 | Complete |
| FOUN-09 | Phase 1 | Complete |
| FOUN-10 | Phase 1 | Complete |
| DSGN-01 | Phase 2 | Complete |
| DSGN-02 | Phase 2 | Complete |
| DSGN-03 | Phase 2 | Complete |
| DSGN-04 | Phase 2 | Complete |
| SHEL-01 | Phase 3 | Complete |
| SHEL-02 | Phase 3 | Complete |
| SHEL-03 | Phase 3 | Complete |
| SHEL-04 | Phase 3 | Complete |
| SHEL-05 | Phase 3 | Complete |
| DATA-01 | Phase 4 | Complete |
| DATA-02 | Phase 4 | Complete |
| DATA-03 | Phase 4 | Complete |
| DATA-04 | Phase 4 | Complete |
| DATA-05 | Phase 4 | Complete |
| DASH-01 | Phase 9 | Pending |
| DASH-02 | Phase 9 | Pending |
| DASH-03 | Phase 9 | Pending |
| DASH-04 | Phase 9 | Pending |
| DASH-05 | Phase 9 | Pending |
| DASH-06 | Phase 9 | Pending |
| AGNT-01 | Phase 5 | Complete |
| AGNT-02 | Phase 5 | Complete |
| AGNT-03 | Phase 5 | Pending |
| AGNT-04 | Phase 5 | Complete |
| AGNT-05 | Phase 5 | Pending |
| AGNT-06 | Phase 5 | Pending |
| TASK-01 | Phase 6 | Pending |
| TASK-02 | Phase 6 | Pending |
| TASK-03 | Phase 6 | Pending |
| TASK-04 | Phase 6 | Pending |
| TASK-05 | Phase 6 | Pending |
| TASK-06 | Phase 6 | Pending |
| TASK-07 | Phase 6 | Pending |
| NTSK-01 | Phase 6 | Pending |
| NTSK-02 | Phase 6 | Pending |
| NTSK-03 | Phase 6 | Pending |
| NTSK-04 | Phase 6 | Pending |
| APPR-01 | Phase 7 | Pending |
| APPR-02 | Phase 7 | Pending |
| APPR-03 | Phase 7 | Pending |
| APPR-04 | Phase 7 | Pending |
| APPR-05 | Phase 7 | Pending |
| APPR-06 | Phase 7 | Pending |
| APPR-07 | Phase 7 | Pending |
| USAG-01 | Phase 8 | Pending |
| USAG-02 | Phase 8 | Pending |
| USAG-03 | Phase 8 | Pending |
| USAG-04 | Phase 8 | Pending |
| USAG-05 | Phase 8 | Pending |
| USAG-06 | Phase 8 | Pending |
| USAG-07 | Phase 8 | Pending |
| SETT-01 | Phase 10 | Pending |
| SETT-02 | Phase 10 | Pending |
| SETT-03 | Phase 10 | Pending |
| SETT-04 | Phase 10 | Pending |
| SETT-05 | Phase 10 | Pending |
| SETT-06 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 67 total
- Mapped to phases: 67
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap creation*
