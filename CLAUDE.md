<!-- GSD:project-start source:PROJECT.md -->
## Project

**OpenClaw Team Manager**

A local mission control dashboard for managing OpenClaw AI agents. It provides fleet management, task tracking, approval workflows, usage metrics, and configuration — all in a dark-mode, data-dense UI inspired by Grafana/Datadog. Built with Rails API + React frontend, running on the same machine as OpenClaw.

**Core Value:** Operators can see and control their entire OpenClaw agent fleet from a single dashboard — what's running, what needs approval, and what it's costing.

### Constraints

- **Tech stack**: Ruby 3.3.3, Rails, React, PostgreSQL 17, Vite, Tailwind CSS — per existing README
- **Testing**: RSpec, Factory Bot, Faker, Playwright with cypress-on-rails, RuboCop
- **App location**: Rails app must live in `source/dashboard`
- **Auth**: Devise — simple email/password, user created via console
- **Assets**: vite_rails for React, Tailwind for styling
- **Dev server**: `bin/dev` must run both Rails and Vite
- **Serialization**: jbuilder for JSON responses
- **Database**: PostgreSQL in Docker via `setup/` scripts
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies (Already Decided)
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Ruby | 3.3.3 | Runtime | Locked by project. Current stable. |
| Rails | ~> 8.0.5 | API backend, ActionCable, ActiveRecord | Rails 8.0.5 released 2026-03-24. Use 8.0.x series -- 8.1 adds framework features (Solid Queue etc.) that are not needed here and 8.0 receives security patches through May 2026+. Provides ActionCable with Solid Cable (no Redis needed), jbuilder 3.0, Devise 5.0 compatibility. |
| React | ^19.2.4 | Frontend SPA | React 19 is the current stable series. 19.2 adds async orchestration improvements relevant to real-time dashboard updates. |
| PostgreSQL | 17.5 | Primary database + ActionCable pub/sub via Solid Cable | Already running in Docker. PG 17 is current stable. Solid Cable uses it as the ActionCable backend, eliminating Redis entirely. |
| Vite | ^6.x (via vite_rails) | Frontend build tool | vite_rails 3.10.0 pins the Vite version it supports. Do NOT manually upgrade to Vite 7/8 -- let vite_rails control the Vite version to avoid compatibility issues. vite_rails 3.10.0 supports Rails 5.1-8.x. |
| Tailwind CSS | ^4.2.2 | Utility-first CSS | v4 brings CSS-first configuration (no more tailwind.config.js), container queries, and the Oxide performance engine. Requires Vite plugin `@tailwindcss/vite` instead of PostCSS. |
| Devise | ~> 5.0.3 | Authentication | v5.0.3 (2026-03-16) adds Rails 8 support, lazy route loading. Console-only user creation per project constraints. |
| jbuilder | ~> 3.0 | JSON serialization | jbuilder 3.0 ships with Rails 8 -- 30% faster JSON rendering. Already a project constraint. |
### Real-Time Communication
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| ActionCable (Rails built-in) | via Rails 8 | WebSocket server for pushing agent events to React | Built into Rails. No additional gem needed. Handles channels, subscriptions, broadcasting out of the box. |
| Solid Cable | ~> 3.0 | ActionCable adapter (DB-backed) | Eliminates Redis dependency entirely. Uses PostgreSQL for pub/sub. Default in Rails 8. Polls the cable table at configurable intervals (default 0.1s). For a local single-machine dashboard this is more than sufficient. |
| @rails/actioncable | ^8.1.300 | JavaScript client for ActionCable | Official npm package. Create subscriptions in React components to receive real-time agent events, approval notifications, and task state changes. |
### Frontend Data Layer
| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| @tanstack/react-query | ^5.95.0 | Server state management, caching, background refetch | The standard for React server-state in 2026. Handles API data fetching, caching, optimistic updates, and automatic background refetch. DevTools for debugging. Replaces the need to store server data in client state. |
| zustand | ^5.0.12 | Client-side UI state (sidebar collapse, active filters, modals) | Minimal boilerplate, hook-based API, no provider wrapper needed. For a dashboard with moderate UI state (filter selections, view toggles, sidebar state), Zustand is the right weight. React Query handles server state; Zustand handles UI state only. |
| react-router | ^7.13.2 | Client-side routing | v7 is the current stable series. Import everything from "react-router" (no more react-router-dom). Non-breaking upgrade path from v6 patterns. Handles the 6 main routes: /, /agents, /tasks, /usage, /approvals, /settings. |
### Charts & Data Visualization
| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| recharts | ^3.8.0 | All charts: area, bar, donut/pie, histogram, sparklines | Recharts v3 is actively maintained (March 2026). SVG-based with clean React component API. Handles all chart types needed: stacked area (token usage), horizontal bar (API calls), pie/donut (cost breakdown), histogram (latency). Built-in responsiveness and theming. Simpler API than Nivo with smaller bundle. |
- **vs Nivo**: Nivo has a larger bundle and more chart types than needed. Recharts covers all 4 required chart types plus sparklines with less overhead.
- **vs Chart.js (react-chartjs-2)**: Canvas-based Chart.js is better for 10K+ data points. This dashboard displays aggregated metrics (hundreds of points max), so SVG rendering is fine and gives better React integration.
- **vs Visx**: Lower-level D3 wrapper requiring more code for standard charts. Recharts gives pre-built chart components.
### Kanban / Drag and Drop
| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop primitives for Task Board Kanban | The standard DnD library for React in 2025-2026. react-beautiful-dnd is deprecated and incompatible with React 18+ strict mode. dnd-kit is actively maintained, accessible, and has extensive Kanban board examples. |
| @dnd-kit/sortable | ^10.0.0 | Sortable preset for Kanban column reordering | Works with @dnd-kit/core to enable card sorting within and between columns. |
| @dnd-kit/utilities | ^4.0.0 | CSS transform utilities for drag animations | Provides useSortable transform styles. |
### Icons
| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| @fortawesome/react-fontawesome | ^3.3.0 | Icon rendering in React components | The design spec explicitly uses Font Awesome 6.4.0 icons (fa-solid weight). Stick with Font Awesome to match the designs exactly -- robot, chart-line, shield-check, coins, etc. are all FA icons. |
| @fortawesome/fontawesome-svg-core | ^6.7.x | SVG icon engine | Tree-shakeable SVG rendering. Only import the icons you use. |
| @fortawesome/free-solid-svg-icons | ^6.7.x | Solid icon pack | All spec icons (robot, chart-line, list-check, chart-pie, shield-check, gear, coins, spinner, stopwatch, network-wired, dollar-sign) are in the free solid set. |
### UI Utilities
| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| clsx | ^2.1.x | Conditional className composition | Lightweight (228B), standard utility for conditional class logic in React + Tailwind. |
| tailwind-merge | ^3.x | Tailwind class conflict resolution | Prevents conflicting Tailwind classes when merging base + override styles. Combined with clsx in a `cn()` utility function. |
| date-fns | ^4.x | Date formatting and relative time | Handles "Just now", "2h ago", "4d 12h 30m" display formats needed throughout the dashboard. Tree-shakeable (import only what you use). Functional API matches React patterns better than dayjs's chaining. |
| sonner | ^2.x | Toast notifications | Lightweight (2-3KB), works without hooks/providers, persists across route changes. For approval confirmations, task creation feedback, WebSocket connection status. |
### Backend Gems (Beyond Core)
| Gem | Version | Purpose | Why Recommended |
|-----|---------|---------|-----------------|
| solid_cable | ~> 3.0 | Database-backed ActionCable adapter | Eliminates Redis. Uses PostgreSQL for pub/sub. Ships with Rails 8. |
| rack-cors | ~> 2.0 | CORS middleware | Required if React dev server runs on a different port than Rails (Vite dev server at 3036, Rails at 3000). Standard for Rails API apps. |
| foreman | ~> 0.88 | Process management (Procfile.dev) | Runs Rails server + Vite dev server together via `bin/dev`. Standard Rails pattern. Install as system gem, not in Gemfile. |
| pundit | ~> 2.4 | Authorization policies | Lightweight authorization. Even with single-user auth, use Pundit for controller-level policy checks -- prevents accidental data exposure and establishes patterns for future multi-user support. |
| pg_search | ~> 2.3 | Full-text search on PostgreSQL | For the global search bar that searches across agents, tasks, and approvals. Uses PostgreSQL's built-in tsvector/tsquery. No Elasticsearch needed. |
| pagy | ~> 9.x | Pagination | Fastest Ruby pagination gem. For task history, approval history, usage tables. Dramatically faster than kaminari/will_paginate. |
| active_model_serializers | N/A | JSON serialization | **DO NOT USE** -- jbuilder is the project constraint. AMS is largely unmaintained anyway. |
### Testing Stack (Already Decided)
| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| rspec-rails | ~> 8.0.4 | Test framework | v8.0.4 supports Rails 8. Includes Rails 8 authentication generator support. |
| factory_bot_rails | ~> 6.5.1 | Test data factories | Latest stable. Works with Rails 8. |
| faker | ~> 3.6.1 | Fake data generation | For mock data layer AND test factories. Generate realistic agent names, task descriptions, token counts. |
| cypress-on-rails | ~> 1.17 | E2E test bridge (Playwright mode) | Supports both Cypress and Playwright. Use `--framework playwright` flag during setup. Provides Rails state control commands from Playwright tests. |
| @playwright/test | ^1.52.x | E2E browser testing | Use Playwright (not Cypress) for E2E tests. Faster execution (290ms vs 420ms per action), free parallelization, multi-browser support. cypress-on-rails gem bridges it to Rails. |
| rubocop | ~> 1.85 | Ruby linting | Latest stable with current rule set. |
| rubocop-rails | ~> 2.x | Rails-specific RuboCop rules | Standard companion to rubocop for Rails projects. |
| rubocop-rspec | ~> 3.x | RSpec-specific RuboCop rules | Enforces RSpec best practices. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| @tanstack/react-query-devtools | ^5.95.0 | Visual debugging for React Query cache | Shows all queries, their cache status, refetch timing. Essential during development. Only loads in development builds. |
| TypeScript | ^5.7.x | Type safety for React code | Use TypeScript for the React frontend. Catches prop errors, API response shape mismatches, and component interface issues at compile time. Vite + vite_rails support .tsx files natively. |
| @types/react | ^19.x | React type definitions | Required for TypeScript + React 19. |
| @types/react-dom | ^19.x | React DOM type definitions | Required for TypeScript + React 19. |
| eslint | ^9.x | JavaScript/TypeScript linting | Flat config format (eslint.config.js). Use with typescript-eslint for TS support. |
| prettier | ^3.x | Code formatting | For consistent JS/TS/CSS formatting. Pair with eslint-config-prettier to avoid conflicts. |
## Installation
### Ruby Gems (Gemfile additions beyond Rails defaults)
# Gemfile
# Authentication
# JSON Serialization (should already be in Rails 8 default)
# Real-time (should already be in Rails 8 default)
# API
# Authorization
# Search
# Pagination
# Frontend
### npm Packages
# Core React
# TypeScript
# Data layer
# Real-time
# Charts
# Drag and drop (Kanban)
# Icons (Font Awesome - free solid set)
# Styling
# Utilities
# Dev tools
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Recharts | Nivo (@nivo/core) | If you need 20+ chart types, server-side rendering of charts, or Canvas rendering for very large datasets. Nivo has a larger bundle but more chart variety. |
| Recharts | react-chartjs-2 | If rendering 10,000+ data points per chart. Canvas-based Chart.js handles massive datasets better than SVG. Not the case for this dashboard. |
| @dnd-kit/core | @hello-pangea/dnd | If migrating an existing react-beautiful-dnd codebase -- it is a drop-in replacement fork. For greenfield, use dnd-kit. |
| @dnd-kit/core | @dnd-kit/react (v0.3.2) | When @dnd-kit/react reaches v1.0 stable. It unifies core+sortable+utilities into one package. Currently too new for production (38 npm dependents). |
| Zustand | Redux Toolkit | If the team is already deeply invested in Redux patterns, or if you need Redux DevTools time-travel debugging. For this dashboard's moderate UI state, Zustand is lighter. |
| Zustand | React Context | For trivial state (theme toggle). Don't use Context for frequently-changing state (filter selections, real-time counters) -- causes unnecessary re-renders. |
| @tanstack/react-query | SWR | If you want a smaller bundle and simpler API. SWR lacks DevTools and has fewer features for complex caching. React Query is the better default for dashboards. |
| Sonner | react-hot-toast | If you need headless toast control via useToaster() hook for maximum customization. Sonner is simpler out of the box. |
| date-fns | dayjs | If bundle size is the top priority (2KB vs 12-40KB). For this project, date-fns's tree-shaking and functional API are worth the small size trade. |
| Font Awesome | Lucide React | If starting from scratch without design constraints. Lucide is tree-shakeable and lighter. But the spec explicitly uses FA icon names. |
| Solid Cable | Redis adapter | If running multiple Rails processes across multiple machines needing sub-10ms pub/sub. This is a single-machine local app -- Solid Cable's polling is fine. |
| Pundit | CanCanCan | If you prefer ability-based (can/cannot) over policy-based authorization. Pundit's policy pattern is simpler and more explicit. |
| pg_search | Elasticsearch | If full-text search needs ranking, fuzzy matching across millions of records. For searching hundreds of agents/tasks/approvals, PG native search is sufficient and adds no infrastructure. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-beautiful-dnd | Deprecated by Atlassian (2022). Incompatible with React 18+ strict mode. No maintenance planned. | @dnd-kit/core + @dnd-kit/sortable |
| Redux (plain) | Massive boilerplate for a dashboard with moderate state. If Redux is ever needed, use RTK. | Zustand for UI state, React Query for server state |
| Moment.js | Deprecated since 2020. 300KB+ bundle. Still appears in tutorials. | date-fns |
| active_model_serializers | Largely unmaintained. Project constraint specifies jbuilder. | jbuilder |
| Redis | Unnecessary infrastructure for a single-machine local app. Solid Cable uses PostgreSQL instead. | Solid Cable (PostgreSQL-backed ActionCable) |
| axios | Unnecessary abstraction over fetch(). React 19 works well with native fetch. @tanstack/react-query wraps fetch calls. | Native fetch + React Query |
| Webpacker / Shakapacker | Legacy Rails JS bundlers. Vite replaces them entirely with faster builds and better DX. | vite_rails |
| styled-components / CSS modules | Redundant when using Tailwind CSS. Adding another styling system creates confusion. | Tailwind CSS + clsx + tailwind-merge |
| kaminari / will_paginate | Significantly slower than pagy. kaminari creates ActiveRecord objects for page links. | pagy |
| @dnd-kit/react v0.x | Pre-1.0, only 38 npm dependents. API may change. | @dnd-kit/core + @dnd-kit/sortable (stable) |
## Version Compatibility Matrix
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| vite_rails ~> 3.10 | Rails 5.1 - 8.x | Controls Vite version internally. Do not install vite separately in Gemfile. |
| vite_rails ~> 3.10 | vite_ruby ~> 3.2 | Automatic dependency. vite_ruby manages the Vite npm package version. |
| Tailwind CSS v4.2 | Vite (via @tailwindcss/vite) | v4 drops PostCSS plugin. Must use `@tailwindcss/vite` Vite plugin instead. |
| Devise ~> 5.0 | Rails >= 7.0 | Tested with Rails 8. Routes lazy-loaded in dev/test. |
| rspec-rails ~> 8.0 | Rails >= 7.2 | Covers Rails 8.0.x and 8.1.x. |
| React 19.2 | @dnd-kit/core 6.3 | Compatible. dnd-kit uses React hooks API. |
| React 19.2 | recharts 3.8 | Compatible. Recharts 3.x targets React 18+. |
| React 19.2 | @tanstack/react-query 5.x | Compatible. TanStack Query 5 supports React 18+. |
| @rails/actioncable 8.1.300 | Rails 8.0.x ActionCable | Major version alignment not required -- the npm package is the JS client, works with any Rails ActionCable server. |
| solid_cable ~> 3.0 | PostgreSQL 17 | Tested with MySQL, SQLite, PostgreSQL. PG 17 fully supported. |
| cypress-on-rails ~> 1.17 | Playwright | Use `--framework playwright` flag. Provides `cy_app_commands` equivalent for Playwright. |
## Stack Patterns by Variant
- Use ActionCable channels: `AgentStatusChannel`, `TaskUpdatesChannel`, `ApprovalChannel`
- React components subscribe via `@rails/actioncable` consumer
- Zustand stores receive pushed data and trigger React Query cache invalidation
- Because: This separates push (ActionCable) from pull (React Query) cleanly
- Use jbuilder views for JSON responses
- React Query manages fetching, caching, and refetching
- Optimistic updates for approve/deny actions (update UI immediately, roll back on error)
- Because: React Query's cache invalidation + refetch handles stale data automatically
- Use Faker gem in seeds.rb and factory_bot for realistic test data
- Rails API serves mock data from PostgreSQL (same API shape as real data)
- ActionCable channels broadcast simulated events on a timer (optional -- for testing real-time UI)
- Because: Mock at the data layer, not the API layer. React code won't change when real data arrives.
- Use Tailwind CSS custom properties in `@theme` block (v4 CSS-first config)
- Define design tokens: `--color-background: #0f1219`, `--color-surface: #1a1f2e`, etc.
- No light mode needed (spec is dark-only)
- Because: Tailwind v4's CSS-first approach means theme tokens live in CSS, not a config file
## Sources
- [Rails 8.0.5 / 8.1.3 release](https://rubyonrails.org/2026/3/24/Rails-Versions-8-0-5-and-8-1-3-have-been-released) -- Rails version confirmation (HIGH confidence)
- [vite_rails on RubyGems](https://rubygems.org/gems/vite_rails/versions/3.0.17) -- vite_rails 3.10.0 version and dependencies (HIGH confidence)
- [Solid Cable GitHub](https://github.com/rails/solid_cable) -- DB-backed ActionCable adapter docs (HIGH confidence)
- [Recharts npm](https://www.npmjs.com/package/recharts) -- v3.8.0 confirmed (HIGH confidence)
- [@dnd-kit/core npm](https://www.npmjs.com/package/@dnd-kit/core) -- v6.3.1 stable (HIGH confidence)
- [@dnd-kit/react npm](https://www.npmjs.com/package/@dnd-kit/react) -- v0.3.2 pre-1.0 (HIGH confidence)
- [Devise releases](https://github.com/heartcombo/devise/releases) -- v5.0.3 with Rails 8 support (HIGH confidence)
- [rspec-rails 8.0.4](https://rubygems.org/gems/rspec-rails/versions/8.0.4) -- Rails 8 compatibility (HIGH confidence)
- [React 19.2 blog](https://react.dev/blog/2025/10/01/react-19-2) -- React 19.2 release notes (HIGH confidence)
- [TanStack Query npm](https://www.npmjs.com/package/@tanstack/react-query) -- v5.95.0 (HIGH confidence)
- [Zustand npm](https://www.npmjs.com/package/zustand) -- v5.0.12 (HIGH confidence)
- [React Router npm](https://www.npmjs.com/package/react-router) -- v7.13.2 (HIGH confidence)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) -- v4.2.2 with CSS-first config (HIGH confidence)
- [cypress-on-rails GitHub](https://github.com/shakacode/cypress-on-rails) -- v1.17.0 with Playwright support (HIGH confidence)
- [LogRocket: Recharts vs Chart.js vs Nivo comparison](https://blog.logrocket.com/best-react-chart-libraries-2025/) -- Charting library comparison (MEDIUM confidence)
- [LogRocket: Kanban board with dnd-kit](https://blog.logrocket.com/build-kanban-board-dnd-kit-react/) -- DnD implementation patterns (MEDIUM confidence)
- [Sonner vs react-hot-toast comparison](https://blog.logrocket.com/react-toast-libraries-compared-2025/) -- Toast library comparison (MEDIUM confidence)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
