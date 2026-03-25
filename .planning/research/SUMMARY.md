# Project Research Summary

**Project:** OpenClaw Team Manager (Command Center)
**Domain:** AI Agent Management Dashboard — Rails API + React SPA
**Researched:** 2026-03-25
**Confidence:** HIGH

## Executive Summary

OpenClaw Command Center is a local-first, operator-grade AI agent management dashboard. The product occupies a unique niche: it combines the observability of tools like LangSmith and Datadog LLM Observability with an operational control plane (task creation, human-in-the-loop approvals) in a single self-hosted, zero-infrastructure-dependency application. Research consistently shows this combination does not exist in the current market — most observability tools are read-only SaaS products, and the few that run locally require complex multi-service stacks. The recommended build approach is a Rails 8 API serving both a React SPA and ActionCable WebSocket channels, backed by PostgreSQL only (no Redis), with a mock data layer that mirrors the real Gateway interface from day one.

The recommended approach follows a strict dependency-ordered build sequence: foundation (Rails + Devise + Vite + database schema) first, then a dark-mode design system and app shell, then the mock data and API layer, then all 7 screens in dependency order, and finally the real-time ActionCable layer as an enhancement on top of already-working screens. This order is not arbitrary — the architecture research identifies the mock data service as the single most important abstraction in the entire codebase, because it is the only thing standing between "building against real Gateway data" and "building the entire UI right now." Every other phase depends on it being correctly structured with swappable interfaces.

The dominant risk is structural: mock data entanglement and missing event-driven architecture are the two pitfalls with HIGH recovery cost (3-5 dev days each). Both can be fully prevented with upfront architecture decisions in Phase 1, costing hours rather than days. Secondary risks — Vite proxy performance, Devise CSRF misconfiguration, and catch-all route conflicts — are LOW recovery cost and easily fixed if they arise, but should still be addressed in scaffolding to avoid blocking early screen development.

## Key Findings

### Recommended Stack

The stack is largely locked by project constraints and confirmed current by research. Rails 8.0.5 + React 19.2 + PostgreSQL 17 + Vite (via vite_rails 3.10) form the core. The most important stack decisions beyond the locked constraints are: (1) Solid Cable as the ActionCable adapter, eliminating Redis entirely; (2) TanStack Query v5 for server state and Zustand v5 for client UI state in a strict dual-store pattern; (3) Recharts v3 for static/low-frequency charts only, with Canvas-based alternatives needed for real-time sparklines and activity timelines; and (4) @dnd-kit/core + @dnd-kit/sortable for the Kanban board, as react-beautiful-dnd is deprecated and incompatible with React 18+ StrictMode.

**Core technologies:**
- Rails 8.0.5: API backend, ActionCable, ActiveRecord — current stable, confirmed 2026-03-24 release
- React 19.2 + TypeScript 5.7: Frontend SPA — React 19 is current stable; TypeScript mandatory for type-safe API contracts
- PostgreSQL 17: Primary DB and ActionCable adapter via Solid Cable — eliminates Redis dependency
- vite_rails 3.10: Frontend build — do not manually upgrade Vite; let vite_rails control the version
- Tailwind CSS v4.2: Dark-first CSS — CSS-first config (no tailwind.config.js), requires @tailwindcss/vite plugin (not PostCSS)
- TanStack Query v5 + Zustand v5: State management — server state and client UI state strictly separated
- Recharts v3: Charts — SVG-based; adequate for static/aggregated charts, inadequate for high-frequency real-time rendering
- @dnd-kit/core v6.3 + @dnd-kit/sortable v10: Drag-and-drop — only actively maintained Kanban DnD library for React 18+
- Devise 5.0.3: Authentication — session cookies, no JWT; CSRF via meta tag in Rails layout
- Faker 3.6 + factory_bot_rails 6.5: Mock data generation — realistic data through the service layer
- @rails/actioncable v8.1: WebSocket client — cache invalidation pattern, not data replacement
- Font Awesome 6.7 (React): Icons — design spec explicitly uses FA icon names; switching to Lucide requires remapping all icons

### Expected Features

**Must have (table stakes) — all 7 screens in v1:**
- Agent Fleet screen — status overview with grid/table toggle, real-time presence indicators
- Task Board (Kanban) — 6 columns (Backlog, Queued, In Progress, Awaiting Approval, Completed, Failed) with drag-and-drop and state-machine-validated transitions
- Approvals screen — pending queue with agent reasoning display, approve/deny with confirmation for P0/Critical, approval history
- Dashboard overview — KPI cards, agent activity timeline, recent tasks table, Action Required sidebar
- Usage and Cost screen — token usage charts, cost breakdown, latency distribution, time range selector, export
- Settings screen — general preferences, agent policies, data sources (budget thresholds, model pricing), notification config
- Global shell — sidebar navigation, top bar with keyboard-accessible search (`/` shortcut), notification bell
- Authentication (Devise) — login/logout, session persistence, console-only user creation
- Mock data layer — realistic fake data with service layer abstraction that allows Gateway swap without touching components

**Should have (competitive differentiators), added in v1.x after Gateway exists:**
- Unified approval queue with agent reasoning — the single feature no competitor offers; genuine HITL control plane
- Task creation and dispatch — makes CC a command plane, not just a monitoring plane
- Live WebSocket approval notifications — push alerts when new approvals arrive
- JSONL session viewer — expandable panel for parsed session data
- Budget-triggered approvals — auto-create approval items when token spend approaches threshold
- Agent actions via context menu — restart, disable, view logs (requires Gateway)

**Defer (v2+):**
- Session transcript replay — AgentOps-style time-travel; massive scope, low initial ROI
- Slack/webhook external notifications — out of scope for local v1 tool
- Queue lane visualization — Gateway-specific feature, defer until queue architecture stabilizes
- Custom dashboard layouts (Grafana-style), API for external tools, batch operations
- LLM evaluation/scoring — a separate product category, not a dashboard feature

### Architecture Approach

The system follows a clean separation: React SPA (TanStack Query + Zustand) communicates with Rails API via HTTP REST for CRUD and ActionCable WebSocket for real-time push. The Rails backend has a mandatory service layer between controllers and models — specifically `MockDataService`, which generates all fake data and implements the same interface `GatewayService` will use. This service abstraction is what makes the mock-to-real transition a service swap rather than a full rewrite. ActionCable channels (one per domain concern: Dashboard, Agent, Task, Approval) broadcast cache invalidation signals; React hooks receive them and trigger TanStack Query refetches rather than rendering from WebSocket payloads directly.

**Major components:**
1. Mock Data Service (Rails) — Faker-backed service object; single point of swap for Gateway integration; same method signatures as future GatewayService
2. API Controllers (Rails, `/api/v1/*`) — thin controllers calling services; jbuilder views for JSON serialization; versioned for future Gateway breaking changes
3. ActionCable Channels — one per domain concern; broadcast event-type signals only (not full payloads); React invalidates TanStack Query caches on receipt
4. React App Shell (AppShell + Sidebar + TopNav) — persistent chrome wrapping React Router `<Outlet/>`; every screen lives inside it
5. Custom Hooks Layer (useAgents, useTasks, useApprovals, etc.) — TanStack Query wrappers; components never call fetch directly; ActionCable invalidation wired here
6. UI Component Library (app/frontend/components/ui/) — design system primitives built once for all 7 screens; dark-theme by default (no `dark:` Tailwind prefix needed)
7. Zustand Stores (uiStore, filterStore, notificationStore) — client-only state; never server data

### Critical Pitfalls

1. **Mock data entanglement in components** — prevent by defining TypeScript interfaces for all API responses in a shared types layer on day one; both MockDataService and components must satisfy the same contracts; mock data must never be imported directly into component files; recovery cost if missed is 2-3 dev days
2. **Missing event-driven architecture before WebSocket integration** — prevent by designing the data layer for push-based updates from the start; useChannel hook should be wired even in mock phase (using MockBroadcastJob); components subscribe to state changes rather than fetch-on-mount; recovery cost if missed is 3-5 dev days
3. **Devise session/CSRF misconfiguration with React SPA** — prevent by serving the SPA via Rails catch-all (same-origin, no CORS), including `csrf_meta_tags` in the Rails layout, and reading the token in the React API client's fetch wrapper; verify login → authenticated API call → page refresh → still authenticated in Phase 1 before building any screens
4. **Rails catch-all route swallowing API and WebSocket routes** — prevent with explicit path exclusions in the catch-all constraint (`!req.path.start_with?('/api/', '/cable', '/vite-dev/', '/@')`); API routes must be defined before the catch-all; write a request spec to verify `/api/*` returns JSON
5. **Vite dev server proxy bottleneck** — prevent by setting `skipProxy: true` in `config/vite.json` and pinning `VITE_RUBY_HOST` to `127.0.0.1`; page loads in development must be under 3 seconds; recovery is 5 minutes but costs a dev day if not caught early
6. **SVG chart performance with real-time data** — prevent by using Recharts only for static/low-frequency charts (cost breakdown, API calls bar, latency histogram); use Canvas-based sparklines (uPlot or custom canvas) for agent card sparklines and the activity timeline; throttle all chart updates to at most once per second

## Implications for Roadmap

Based on combined research, the architecture defines a natural 5-phase build order with clear dependency gates between phases. Do not compress phases or reorder them — the dependency logic is tight.

### Phase 1: Foundation and Scaffolding

**Rationale:** Everything else depends on a working Rails + React app with auth, correct routing, and a dev server that is not bottlenecked. This phase is almost entirely about avoiding Phase 1 pitfalls that become permanent technical debt. The mock data service interface must be established here, before any component touches data.
**Delivers:** Running Rails 8 app with Devise auth, vite_rails configured with skipProxy, SPA catch-all route with constraints, database schema (Agent, Task, Approval, UsageSnapshot, Setting, User), and a TypeScript-typed service interface that MockDataService implements. Verified: login works, CSRF works, page refresh preserves session, `/api/*` returns JSON, `/*` returns HTML.
**Addresses:** Authentication (table stakes), mock data layer foundation
**Avoids:** Pitfall 1 (mock entanglement), Pitfall 2 (Devise CSRF), Pitfall 3 (catch-all conflicts), Pitfall 5 (Vite proxy bottleneck)

### Phase 2: Design System and App Shell

**Rationale:** All 7 screens share the same design system components and live inside the same App Shell. Building the shell and component library before any screen prevents ad-hoc component creation that diverges visually. The investment in Card, Badge, Button, StatusDot, KpiCard, DataTable, Modal, and chart wrappers pays off across every subsequent screen.
**Delivers:** Tailwind v4 dark theme tokens (no `dark:` prefix — dark-only app), UI component library in `app/frontend/components/ui/`, AppShell with Sidebar and TopNav, React Router v7 nested routes with placeholder pages for all 6 routes, "Demo Mode" banner component wired to environment flag.
**Uses:** Tailwind CSS v4 (@tailwindcss/vite plugin), clsx + tailwind-merge, Font Awesome React, react-router v7
**Avoids:** Pitfall: third-party components flashing white (all components dark-native from the start)

### Phase 3: Mock Data Pipeline (API + Data Layer)

**Rationale:** Screens cannot be built without data. This phase creates the full data pipeline from PostgreSQL seed data through Rails API controllers to React hooks — with no real screens yet. Building this before screens means screens can focus purely on UI, not data plumbing. This phase also wires the useChannel hook with MockBroadcastJob so real-time event flow is validated with at least one consumer before the full screen build.
**Delivers:** MockDataService with Faker-backed seed data for all entity types, all `/api/v1/*` endpoints with jbuilder views, TanStack Query hooks for all domains (useAgents, useTasks, useApprovals, useUsage, useDashboard), API client with CSRF header, MockBroadcastJob emitting fake events on a timer, and at least one component (Dashboard KPI cards) updating reactively from the event stream.
**Uses:** Faker 3.6, factory_bot_rails, jbuilder 3.0, pagy 9.x, pg_search 2.3, pundit 2.4, TanStack Query v5, Zustand v5, @rails/actioncable
**Avoids:** Pitfall 4 (missing event-driven architecture for WebSocket transition), N+1 query patterns (Bullet gem in dev)

### Phase 4: All 7 Screens (Dependency Order)

**Rationale:** Screens are built in the order defined by the feature dependency graph. Dashboard is the integration layer that pulls from all other screens, so it is built first to expose missing component needs early. Agent Fleet and Task Board are the core operational screens. Approvals is the key differentiator. Usage and Settings are lower-dependency and come last.
**Delivers:** All 7 complete screens consuming mock data: Dashboard Overview, Agent Fleet, Task Board with Kanban and New Task modal, Approvals with approval history, Usage and Cost with Recharts charts, Settings, Login.
**Screen order:**
1. Dashboard Overview — integrates most component types; exposes gaps in design system early
2. Agent Fleet — grid/table toggle, agent cards, status badges, context menus
3. Task Board — Kanban (dnd-kit), 6-column state machine, drag validation, New Task modal
4. Approvals — expandable cards with agent reasoning, approve/deny with P0 confirmation, history tab
5. Usage and Cost — Recharts stacked area, donut, bar chart, histogram; time range selector; export
6. Settings — tabbed form (General, Agents, Notifications, Data Sources)
7. Global Search — pg_search cross-entity results
**Uses:** recharts v3, @dnd-kit/core + @dnd-kit/sortable, date-fns, sonner, pagy (for pagination in tables)
**Avoids:** Pitfall 6 (SVG chart performance — use Canvas for sparklines), Pitfall 7 (Kanban DnD library), approval UX safety (confirmation for P0/Critical)

### Phase 5: Real-Time Layer (ActionCable)

**Rationale:** Real-time is an enhancement layer, not a foundation layer. All screens must work correctly with polling and manual refresh before WebSocket push is added. This keeps the most complex integration (ActionCable + React + TanStack Query cache invalidation) isolated to one phase where it can be debugged in isolation.
**Delivers:** Four ActionCable channels (DashboardChannel, AgentChannel, TaskChannel, ApprovalChannel) broadcasting cache invalidation signals, useChannel hook wiring in all page components, notification store with unread count and notification bell, "Disconnected" banner with reconnect state.
**Uses:** ActionCable (Rails built-in), Solid Cable 3.0, @rails/actioncable v8.1
**Note:** This phase produces a fully real-time mock dashboard. Gateway integration (Phase N, future) is a service swap — replacing MockDataService with GatewayService and MockBroadcastJob with a real Gateway WebSocket client.

### Phase Ordering Rationale

- Foundation before everything because broken auth, broken routing, or a slow dev server blocks every subsequent phase
- Design system before screens because shared components must exist before they can be used consistently; retrofitting a design system into existing screens is expensive
- Mock data pipeline before screens because building screens with hardcoded data means rewriting them when the API layer exists — doing both at once in the same phase is the most common cause of component/API coupling
- Screens before real-time because WebSocket is an enhancement; every screen must degrade gracefully to polling/manual refresh — this also isolates the complex cache invalidation logic to a single debuggable phase
- All of this mirrors the Build Order Implications section of ARCHITECTURE.md exactly, which arrived at the same order independently from feature dependency analysis

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Task Board screen):** Kanban state machine has 6 columns with non-obvious valid transitions (e.g., cannot drag Completed back to In Progress without an explicit retry). Valid transition matrix needs to be defined against the OpenClaw Gateway task lifecycle spec before implementation.
- **Phase 5 (Real-time Layer):** ActionCable authentication in WebSocket connections (find_verified_user from session cookie) has subtle differences from HTTP auth. Worth a targeted research pass on the ApplicationCable::Connection setup pattern for Devise + session cookies.
- **Phase N (Gateway Integration, future):** The Gateway WebSocket protocol, event payload shapes, and RPC structure are not yet defined. When this phase arrives, it will need research on the actual Gateway API before any service layer work begins.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Rails 8 + vite_rails + Devise setup is extensively documented; pitfall research already covers the specific gotchas
- **Phase 2 (Design System):** Tailwind v4 dark theme configuration is straightforward; component patterns are well-established
- **Phase 3 (Mock Data Pipeline):** Rails service objects + jbuilder + TanStack Query + factory_bot are all standard patterns with abundant documentation
- **Phase 5 (ActionCable):** Cache invalidation pattern (WS signal triggers TanStack Query invalidation) is a documented, standard approach

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against official releases and npm; version compatibility matrix confirmed; alternatives clearly assessed |
| Features | HIGH | Competitive analysis spans 7 major platforms; feature categorization backed by industry adoption data (89% observability usage); differentiators confirmed as genuinely unique |
| Architecture | HIGH | Patterns are established Rails + React conventions; service layer, dual state management, and WebSocket cache invalidation are all well-documented approaches; build order derived from clear dependency analysis |
| Pitfalls | HIGH | All critical pitfalls backed by multiple community sources; recovery costs are realistic estimates; prevention strategies are specific and actionable |

**Overall confidence:** HIGH

### Gaps to Address

- **Gateway WebSocket protocol:** The entire real-time integration depends on Gateway event payload shapes and connection protocol. These are unknown until Gateway is built. MockDataService must define a provisional interface that can be updated when Gateway spec is available.
- **Chart performance thresholds:** PITFALLS.md recommends Canvas-based sparklines for real-time agent cards, but the exact breakpoint where SVG Recharts becomes problematic (agent count, event frequency) is based on community benchmarks rather than project-specific profiling. Validate actual FPS with 50 agents in Phase 4.
- **JSONL session file format:** Usage screen parsing depends on the format of `~/.openclaw/agents/*/sessions/*.jsonl` files. UsageCalculator service design depends on this format. Will need to inspect real session files when available or define the format contract with the Gateway team.
- **Approval state machine edge cases:** The approval workflow covers the standard flow (pending → approved/denied), but edge cases (agent timeout while approval is pending, approval for an agent that has since been disabled, cascading approvals) need definition before implementation.

## Sources

### Primary (HIGH confidence)
- [Rails 8.0.5 release — rubyonrails.org](https://rubyonrails.org/2026/3/24/Rails-Versions-8-0-5-and-8-1-3-have-been-released) — Rails version and Solid Cable confirmation
- [Solid Cable GitHub — rails/solid_cable](https://github.com/rails/solid_cable) — DB-backed ActionCable adapter, PostgreSQL support
- [Devise 5.0.3 releases — heartcombo/devise](https://github.com/heartcombo/devise/releases) — Rails 8 support, lazy route loading
- [TanStack Query npm](https://www.npmjs.com/package/@tanstack/react-query) — v5.95.0, React 18+ support
- [Zustand npm](https://www.npmjs.com/package/zustand) — v5.0.12
- [React Router npm](https://www.npmjs.com/package/react-router) — v7.13.2
- [Tailwind CSS v4 — tailwindcss.com](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, @tailwindcss/vite plugin
- [@dnd-kit/core npm](https://www.npmjs.com/package/@dnd-kit/core) — v6.3.1 stable; @dnd-kit/react v0.3.2 pre-1.0 (avoid)
- [Recharts npm](https://www.npmjs.com/package/recharts) — v3.8.0, March 2026 active maintenance confirmed
- [rspec-rails 8.0.4 — RubyGems](https://rubygems.org/gems/rspec-rails/versions/8.0.4) — Rails 8 compatibility
- [cypress-on-rails GitHub — shakacode](https://github.com/shakacode/cypress-on-rails) — v1.17.0 Playwright support
- [Action Cable Overview — Rails Guides](https://guides.rubyonrails.org/action_cable_overview.html) — channel patterns, connection auth
- [Vite Ruby Rails Integration](https://vite-ruby.netlify.app/guide/rails.html) — skipProxy, proxy config
- [vite_rails on RubyGems](https://rubygems.org/gems/vite_rails/versions/3.0.17) — version and dependency management
- [State of Agent Engineering — LangChain](https://www.langchain.com/state-of-agent-engineering) — 89% observability adoption data

### Secondary (MEDIUM confidence)
- [LogRocket: Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) — Recharts vs Nivo vs Chart.js comparison; SVG performance limits
- [LogRocket: Kanban board with dnd-kit](https://blog.logrocket.com/build-kanban-board-dnd-kit-react/) — implementation patterns
- [Top 5 AI Agent Observability Platforms 2026](https://o-mega.ai/articles/top-5-ai-agent-observability-platforms-the-ultimate-2026-guide) — cross-platform feature comparison
- [Human-in-the-Loop Best Practices — Permit.io](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo) — HITL approval patterns
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/) — data-dense UX patterns
- [Optimizing Real-Time Performance: WebSockets and React.js](https://medium.com/@SanchezAllanManuel/optimizing-real-time-performance-websockets-and-react-js-integration-part-ii-4a3ada319630) — batching, throttling, memoization
- [Building with Mock Data: Smart Strategy or Future Headache?](https://medium.com/lotuss-it/building-with-mock-data-smart-front-end-strategy-or-future-headache-548cafe95c7b) — mock entanglement patterns
- [Rails CSRF protection for SPA](https://blog.eq8.eu/article/rails-api-authentication-with-spa-csrf-tokens.html) — Devise + SPA auth patterns
- [Vite Ruby Troubleshooting Guide](https://vite-ruby.netlify.app/guide/troubleshooting) — proxy performance, HMR issues

---
*Research completed: 2026-03-25*
*Ready for roadmap: yes*
