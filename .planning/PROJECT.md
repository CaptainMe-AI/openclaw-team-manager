# OpenClaw Team Manager

## What This Is

A local mission control dashboard for managing OpenClaw AI agents. It provides fleet management, task tracking, approval workflows, usage metrics, and configuration — all in a dark-mode, data-dense UI inspired by Grafana/Datadog. Built with Rails API + React frontend, running on the same machine as OpenClaw.

## Core Value

Operators can see and control their entire OpenClaw agent fleet from a single dashboard — what's running, what needs approval, and what it's costing.

## Requirements

### Validated

- [x] Rails app scaffolded in `source/dashboard` with Devise auth, PostgreSQL, Vite + React, Tailwind — Validated in Phase 01: Foundation
- [x] Docker-based PostgreSQL via setup scripts in `setup/` — Validated in Phase 01: Foundation
- [x] `bin/dev` runs Rails server + Vite dev server together — Validated in Phase 01: Foundation
- [x] Devise authentication (user created via console, no signup form) — Validated in Phase 01: Foundation
- [x] Design system: dark theme (21 color tokens), Inter + JetBrains Mono typography, 6 reusable components (StatusDot, Badge, Card, Button, Input, Table) — Validated in Phase 02: Design System
- [x] Responsive layout baseline: Tailwind breakpoints, overflow-x-auto tables, grid responsive columns — Validated in Phase 02: Design System
- [x] Global shell: persistent sidebar navigation + top bar with search, notifications, user menu — Validated in Phase 03: App Shell

### Active
- [ ] Dashboard screen: KPI cards, agent activity timeline, recent tasks table, action required sidebar
- [ ] Agent Fleet screen: grid/table view toggle, agent cards with status/task/uptime/tokens, context menu actions, filters
- [ ] Task Board screen: Kanban columns (Backlog → Queued → In Progress → Awaiting Approval → Completed → Failed), draggable cards, priority system
- [ ] Create New Task modal: form with agent assignment, description, attachments, priority
- [ ] Approvals screen: pending queue with approve/deny actions, expanded agent reasoning, history tab
- [ ] Usage & Cost Tracking screen: KPI cards, token usage charts, cost breakdown, latency distribution, export
- [ ] Settings screen: general preferences, agent policies, notifications, data sources tabs
- [ ] Mock data layer: realistic fake data for all screens until Gateway integration

### Out of Scope

- Real OpenClaw Gateway WebSocket integration — mock data first, wire up later
- User registration/signup flow — users created via Rails console only
- Email delivery — no verification or password reset emails in v1
- Mobile native app — web only
- Multi-tenancy — single local installation

## Context

- OpenClaw is an AI agent orchestration system. The Gateway (WebSocket server at `ws://127.0.0.1:18789`) is not yet set up. All data that would come from Gateway events and filesystem reads will be mocked.
- 7 design screens exist as HTML mockups and PNG screenshots in `designs/`. A detailed TEAM_MANAGER_SPEC.md maps every UI element to its data source. A UX_SPEC.md provides the overall layout and interaction patterns.
- Designs are a starting point — open for improvements during implementation.
- The app runs locally alongside OpenClaw on the same machine. No cloud deployment needed.
- Database runs in Docker using the compose file at `setup/Dockerfile-local-services.yml`.

## Constraints

- **Tech stack**: Ruby 3.3.3, Rails, React, PostgreSQL 17, Vite, Tailwind CSS — per existing README
- **Testing**: RSpec, Factory Bot, Faker, Playwright with cypress-on-rails, RuboCop
- **App location**: Rails app must live in `source/dashboard`
- **Auth**: Devise — simple email/password, user created via console
- **Assets**: vite_rails for React, Tailwind for styling
- **Dev server**: `bin/dev` must run both Rails and Vite
- **Serialization**: jbuilder for JSON responses
- **Database**: PostgreSQL in Docker via `setup/` scripts

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mock data first, Gateway later | Gateway not built yet; unblocks full UI development | — Pending |
| All 7 screens in v1 | Complete dashboard experience needed from the start | — Pending |
| Devise console-only auth | Simplest auth path; no email infra needed | — Pending |
| Designs open for improvements | Specs are starting point, not pixel-perfect contract | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-27 after Phase 03: App Shell completion*
