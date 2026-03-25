# Architecture Research

**Domain:** AI Agent Management Dashboard (Rails API + React SPA)
**Researched:** 2026-03-25
**Confidence:** HIGH

## System Overview

```
+-----------------------------------------------------------------------+
|                         BROWSER (React SPA)                           |
|                                                                       |
|  +------------------+  +------------------+  +------------------+     |
|  |   App Shell      |  |   Page Routes    |  |  Shared State    |     |
|  |  (Sidebar, Top   |  | (Dashboard, Fleet|  | (Zustand stores, |     |
|  |   Nav, Layout)   |  |  Tasks, etc.)    |  |  TanStack Query) |     |
|  +--------+---------+  +--------+---------+  +--------+---------+     |
|           |                      |                     |              |
|           +----------+-----------+---------------------+              |
|                      |                                                |
|  +-------------------v-------------------------------------------+    |
|  |              API Client Layer (fetch / TanStack Query)        |    |
|  |  REST requests: /api/v1/*       ActionCable consumer (WS)    |    |
|  +-------------------+----------------------------+--------------+    |
+----------------------|----------------------------|--------------------|
                       | HTTP (JSON)                | WebSocket          |
+----------------------|----------------------------|--------------------|
|                 RAILS API SERVER (source/dashboard)                   |
|                                                                       |
|  +-------------------v-------------------+  +-----v--------------+   |
|  |         API Controllers (v1)          |  |   ActionCable      |   |
|  |  agents, tasks, approvals, usage,     |  |   Channels         |   |
|  |  settings, dashboard, search          |  | (DashboardChannel,  |   |
|  +-------------------+-------------------+  |  AgentChannel,     |   |
|                      |                      |  TaskChannel,      |   |
|  +-------------------v-------------------+  |  ApprovalChannel)  |   |
|  |         Service Layer                 |  +-----+--------------+   |
|  |  MockDataService (Phase 1)            |        |                  |
|  |  GatewayService  (Phase N, future)    |--------+                  |
|  |  UsageCalculator, ApprovalProcessor   |                           |
|  +-------------------+-------------------+                           |
|                      |                                                |
|  +-------------------v-------------------+                           |
|  |         Models + ActiveRecord         |                           |
|  |  Agent, Task, Approval, UsageSnapshot,|                           |
|  |  Setting, User                        |                           |
|  +-------------------+-------------------+                           |
|                      |                                                |
+----------------------|------------------------------------------------+
                       |
          +------------v-----------+
          |      PostgreSQL 17     |
          |    (Docker, port 5411) |
          +------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| React App Shell | Persistent sidebar navigation, top bar with search/notifications, layout container with `<Outlet/>` for page content | Single `AppLayout` component wrapping React Router `<Outlet/>` |
| Page Routes | 7 screen components (Dashboard, Agents, Tasks, Approvals, Usage, Settings + New Task modal) | React Router v7 nested routes under the app shell layout |
| Zustand Stores | Client-side UI state: sidebar collapse, active filters, modal visibility, notification state | Small per-concern stores (uiStore, filterStore, notificationStore) |
| TanStack Query | Server state: fetching, caching, background refreshing all API data; cache invalidation on WebSocket pushes | QueryClient with query keys per resource, custom hooks per domain |
| API Controllers | RESTful JSON endpoints namespaced under `/api/v1/`, authenticated via Devise session cookies | Versioned namespace: `Api::V1::AgentsController`, etc. |
| ActionCable Channels | Push real-time updates to React clients for agent status changes, task state transitions, new approval requests, dashboard KPI updates | One channel per concern broadcasting JSON payloads; React subscribes via `@rails/actioncable` |
| Service Layer | Business logic encapsulated outside controllers: mock data generation, usage calculation, approval processing, future Gateway integration | Plain Ruby service objects in `app/services/` |
| Mock Data Service | Generates realistic fake data for all screens until the OpenClaw Gateway exists; single point to swap out for real data later | `MockDataService` using Faker gem, replaceable by `GatewayService` behind a common interface |
| Models | Data persistence, validations, scopes, associations | Standard ActiveRecord models with DB-backed state |
| Jbuilder Views | JSON serialization from Rails models to API responses | `app/views/api/v1/<resource>/index.json.jbuilder`, `show.json.jbuilder` |

## Recommended Project Structure

### Rails Backend (`source/dashboard/`)

```
source/dashboard/
├── app/
│   ├── channels/
│   │   ├── application_cable/
│   │   │   ├── connection.rb          # Auth: verify Devise user from cookies
│   │   │   └── channel.rb
│   │   ├── dashboard_channel.rb       # KPI updates, activity timeline
│   │   ├── agent_channel.rb           # Agent status changes
│   │   ├── task_channel.rb            # Task state transitions
│   │   └── approval_channel.rb        # New approvals, decisions
│   ├── controllers/
│   │   ├── application_controller.rb
│   │   └── api/
│   │       └── v1/
│   │           ├── base_controller.rb # Shared auth, error handling, pagination
│   │           ├── dashboard_controller.rb
│   │           ├── agents_controller.rb
│   │           ├── tasks_controller.rb
│   │           ├── approvals_controller.rb
│   │           ├── usage_controller.rb
│   │           ├── settings_controller.rb
│   │           └── search_controller.rb
│   ├── models/
│   │   ├── user.rb                    # Devise model
│   │   ├── agent.rb                   # Agent registry + status
│   │   ├── task.rb                    # Task lifecycle (state machine)
│   │   ├── approval.rb               # Pending + historical approvals
│   │   ├── usage_snapshot.rb          # Time-bucketed token/cost data
│   │   └── setting.rb                # Key-value app configuration
│   ├── services/
│   │   ├── mock_data_service.rb       # Faker-based realistic data generation
│   │   ├── mock_realtime_service.rb   # Periodic broadcasts of fake updates
│   │   ├── usage_calculator.rb        # Token aggregation + cost computation
│   │   └── approval_processor.rb      # Approve/deny logic + broadcasting
│   ├── views/
│   │   ├── layouts/
│   │   │   └── application.html.erb   # Vite tags, React mount point
│   │   └── api/
│   │       └── v1/
│   │           ├── dashboard/
│   │           ├── agents/
│   │           ├── tasks/
│   │           ├── approvals/
│   │           ├── usage/
│   │           └── settings/
│   └── jobs/
│       └── mock_broadcast_job.rb      # Background job to emit fake WS events
├── app/frontend/                      # Vite-Rails React app root
│   ├── entrypoints/
│   │   └── application.tsx            # React DOM root mount + providers
│   ├── App.tsx                        # Router + QueryClient + layout
│   ├── routes.tsx                     # Route definitions
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx           # Sidebar + TopNav + <Outlet/>
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNav.tsx
│   │   │   └── Breadcrumb.tsx
│   │   ├── ui/                        # Design system primitives
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── StatusDot.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── Sparkline.tsx
│   │   ├── charts/                    # Recharts wrappers
│   │   │   ├── AreaChart.tsx
│   │   │   ├── DonutChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── Histogram.tsx
│   │   └── shared/                    # Cross-screen composites
│   │       ├── AgentCard.tsx
│   │       ├── TaskCard.tsx
│   │       ├── ApprovalCard.tsx
│   │       └── PriorityBadge.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── AgentFleet.tsx
│   │   ├── TaskBoard.tsx
│   │   ├── Approvals.tsx
│   │   ├── Usage.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── hooks/
│   │   ├── useAgents.ts               # TanStack Query hook for agents
│   │   ├── useTasks.ts
│   │   ├── useApprovals.ts
│   │   ├── useUsage.ts
│   │   ├── useDashboard.ts
│   │   ├── useSettings.ts
│   │   ├── useSearch.ts
│   │   └── useChannel.ts             # ActionCable subscription hook
│   ├── stores/
│   │   ├── uiStore.ts                 # Sidebar state, view toggles
│   │   ├── filterStore.ts             # Active filters per page
│   │   └── notificationStore.ts       # Unread count, notification list
│   ├── api/
│   │   ├── client.ts                  # Base fetch wrapper with CSRF + credentials
│   │   ├── agents.ts                  # API functions: getAgents, getAgent, etc.
│   │   ├── tasks.ts
│   │   ├── approvals.ts
│   │   ├── usage.ts
│   │   ├── dashboard.ts
│   │   ├── settings.ts
│   │   └── cable.ts                   # ActionCable consumer setup
│   ├── types/
│   │   ├── agent.ts
│   │   ├── task.ts
│   │   ├── approval.ts
│   │   ├── usage.ts
│   │   └── common.ts                  # Shared types (pagination, etc.)
│   └── styles/
│       └── tailwind.css               # Tailwind directives + custom theme tokens
├── config/
│   ├── routes.rb                      # API routes + catch-all for SPA
│   ├── cable.yml                      # ActionCable adapter config
│   └── vite.json                      # Vite-Rails configuration
├── vite.config.ts                     # Vite build configuration
└── tailwind.config.js                 # Tailwind theme: dark mode colors, fonts
```

### Structure Rationale

- **`app/frontend/`:** vite_rails convention. Keeps the entire React SPA co-located but separate from Rails Ruby code. Vite serves it in development with HMR; in production it compiles to `public/vite-assets/`.
- **`app/frontend/pages/`:** One file per screen. Each page is a route-level component that composes UI components and hooks. Keeps screen-level orchestration separate from reusable pieces.
- **`app/frontend/hooks/`:** Custom hooks per domain entity (agents, tasks, etc.) wrapping TanStack Query. This is where data fetching, caching, and real-time cache invalidation logic lives. Components never call fetch directly.
- **`app/frontend/api/`:** Thin function layer that maps to Rails API endpoints. Used by hooks only. Makes it trivial to change endpoints without touching component code.
- **`app/frontend/stores/`:** Zustand stores for client-only state (sidebar collapse, view mode toggles, filter selections). Deliberately separate from server state managed by TanStack Query.
- **`app/frontend/components/ui/`:** Design system primitives matching the spec's dark theme. Built once, used everywhere. Ensures visual consistency across all 7 screens.
- **`app/controllers/api/v1/`:** Versioned API namespace. The `v1` prefix protects against breaking changes when the Gateway integration lands later. `BaseController` handles auth, error formatting, and pagination.
- **`app/services/`:** Service objects keep controllers thin. The mock data service is the critical abstraction -- all data generation happens here, so swapping to real Gateway data later means replacing one service, not rewriting controllers.
- **`app/channels/`:** ActionCable channels organized by domain concern. Each channel broadcasts updates relevant to its screen. The mock realtime service feeds these channels with fake events during development.

## Architectural Patterns

### Pattern 1: Dual State Management (Zustand + TanStack Query)

**What:** Use TanStack Query exclusively for server-derived state (API data) and Zustand exclusively for client-only UI state. Never mix the two concerns.

**When to use:** Any React dashboard that fetches data from APIs and also needs local UI state (filters, toggles, modals).

**Trade-offs:** Adds two dependencies instead of one unified store. But eliminates the most common dashboard bug: stale server data caused by managing API responses in a client state store. TanStack Query handles caching, background refetching, and stale-while-revalidate automatically.

**Example:**
```typescript
// hooks/useAgents.ts -- TanStack Query for server state
import { useQuery } from '@tanstack/react-query';
import { getAgents } from '../api/agents';

export function useAgents(filters: AgentFilters) {
  return useQuery({
    queryKey: ['agents', filters],
    queryFn: () => getAgents(filters),
    staleTime: 30_000, // 30s before background refetch
  });
}

// stores/uiStore.ts -- Zustand for client-only state
import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  agentViewMode: 'grid' | 'table';
  toggleSidebar: () => void;
  setAgentViewMode: (mode: 'grid' | 'table') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  agentViewMode: 'grid',
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setAgentViewMode: (mode) => set({ agentViewMode: mode }),
}));
```

### Pattern 2: ActionCable-Driven Cache Invalidation

**What:** WebSocket messages from ActionCable do not replace TanStack Query's data -- they invalidate specific query caches, triggering a background refetch. This keeps the single source of truth at the API layer while providing real-time push notifications.

**When to use:** When you need real-time updates but want to avoid duplicating data fetching logic in both REST and WebSocket paths.

**Trade-offs:** Slightly more network traffic than pure WebSocket push (each WS message triggers an HTTP refetch). But far simpler to implement and debug. The API endpoint remains the canonical data source.

**Example:**
```typescript
// hooks/useChannel.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cable } from '../api/cable';

export function useChannel(channelName: string, queryKeys: string[][]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = cable.subscriptions.create(channelName, {
      received(data: { type: string }) {
        // Invalidate relevant caches when server pushes an update
        queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      },
    });
    return () => subscription.unsubscribe();
  }, [channelName, queryKeys, queryClient]);
}

// Usage in a page component
function TaskBoard() {
  useChannel('TaskChannel', [['tasks'], ['dashboard']]);
  const { data: tasks } = useTasks(filters);
  // ...
}
```

### Pattern 3: Mock Data Service with Swappable Interface

**What:** A Ruby service object that generates realistic fake data using Faker, conforming to the same data shapes the real Gateway would produce. Controllers call the service; they never know if data is mocked or real.

**When to use:** When the upstream data source (OpenClaw Gateway) does not exist yet, but you need to build the complete UI and API surface.

**Trade-offs:** Requires upfront investment defining realistic mock data shapes. But unblocks all frontend development and API contract definition. When Gateway arrives, you swap the service implementation, not the controller or frontend code.

**Example:**
```ruby
# app/services/mock_data_service.rb
class MockDataService
  AGENT_NAMES = %w[Alpha Bravo Charlie Delta Echo Foxtrot].freeze
  MODELS = %w[opus sonnet].freeze

  def agents(filters: {})
    Agent.includes(:tasks).then do |scope|
      scope = scope.where(status: filters[:status]) if filters[:status].present?
      scope = scope.where(model: filters[:model]) if filters[:model].present?
      scope
    end
  end

  def dashboard_kpis(period:)
    {
      active_agents: Agent.where(status: 'active').count,
      tasks_in_progress: Task.where(status: 'in_progress').count,
      pending_approvals: Approval.where(status: 'pending').count,
      tokens_used_24h: UsageSnapshot.where('recorded_at > ?', 24.hours.ago).sum(:total_tokens),
    }
  end
end

# Future replacement:
# class GatewayService
#   def agents(filters: {})
#     # Real WebSocket RPC to Gateway + DB hybrid
#   end
# end
```

### Pattern 4: SPA Routing with Rails Catch-All

**What:** Rails serves API routes under `/api/v1/*` and ActionCable at `/cable`. All other GET requests fall through to a catch-all route that renders `application.html.erb`, which mounts the React SPA. React Router then handles client-side routing.

**When to use:** Any Rails + React SPA where the frontend manages its own routes.

**Trade-offs:** Clean separation, but requires careful route ordering in `config/routes.rb` to ensure API routes match before the catch-all.

**Example:**
```ruby
# config/routes.rb
Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'api/v1/sessions'
  }

  namespace :api do
    namespace :v1 do
      resource :dashboard, only: [:show]
      resources :agents, only: [:index, :show, :update]
      resources :tasks, only: [:index, :show, :create, :update]
      resources :approvals, only: [:index, :show, :update]
      resource :usage, only: [:show]
      resource :settings, only: [:show, :update]
      resource :search, only: [:show]
    end
  end

  # ActionCable mount
  mount ActionCable.server => '/cable'

  # SPA catch-all: must be last
  get '*path', to: 'spa#index', constraints: ->(req) { !req.xhr? && req.format.html? }
  root 'spa#index'
end
```

## Data Flow

### Request Flow (REST API)

```
[User interacts with React UI]
    |
    v
[TanStack Query hook] --> [api/agents.ts fetch function]
    |                           |
    |                           v
    |                     [Rails API Controller]
    |                           |
    |                           v
    |                     [Service Layer (Mock or Real)]
    |                           |
    |                           v
    |                     [ActiveRecord Model + DB Query]
    |                           |
    |                           v
    |                     [Jbuilder JSON View]
    |                           |
    v                           v
[TanStack Query cache] <-- [JSON Response]
    |
    v
[React component re-renders with new data]
```

### Real-Time Update Flow (WebSocket)

```
[Mock Realtime Service / Future Gateway Events]
    |
    v
[ActionCable Channel broadcasts]
    |
    v (WebSocket push)
[React useChannel hook receives message]
    |
    v
[queryClient.invalidateQueries(['agents'])]
    |
    v
[TanStack Query refetches from REST API]
    |
    v
[React component re-renders with fresh data]
```

### Authentication Flow

```
[Login Page]
    |
    v
[POST /users/sign_in (Devise)]  -- credentials in request body
    |
    v
[Rails creates encrypted session cookie]
    |
    v
[Cookie sent automatically with every subsequent request]
    |
    v
[API controllers: authenticate_user! via Devise]
    |
[ActionCable connection: find_verified_user from session cookie]
```

### Key Data Flows

1. **Dashboard KPI refresh:** TanStack Query polls `/api/v1/dashboard` every 30 seconds (configurable via Settings). ActionCable `DashboardChannel` also pushes invalidation when mock service generates new events, triggering an immediate refetch rather than waiting for the next poll.

2. **Task state transition:** User drags a task card on the Kanban board. React fires a PATCH to `/api/v1/tasks/:id` with new status. Controller updates the DB, then broadcasts via `TaskChannel`. All connected clients invalidate their `['tasks']` cache and refetch, seeing the updated board.

3. **Approval workflow:** ActionCable `ApprovalChannel` pushes when a new approval arrives. React invalidates `['approvals']` and `['dashboard']` caches. User clicks Approve -- PATCH `/api/v1/approvals/:id`. Server processes decision, broadcasts result, all clients update.

4. **Mock realtime simulation:** A background job (`MockBroadcastJob`) runs on a configurable interval (e.g., every 10-60 seconds). It randomly generates agent status changes, task progress events, or new approval requests. It persists these to the DB and broadcasts via the relevant ActionCable channel. This simulates what the real Gateway WebSocket would produce.

## Authentication Architecture

**Approach: Devise with session cookies (no JWT).**

This is a same-origin, single-user, local-only application. JWT adds unnecessary complexity. Devise's default session cookie authentication works out of the box:

- Rails is not in API-only mode (it needs to serve the SPA HTML shell), so session middleware is available.
- The React SPA is served by the same Rails server, so cookies are same-origin -- no CORS complications.
- `authenticate_user!` in controllers and `find_verified_user` in ActionCable connections use the same session cookie.
- No signup flow needed -- users are created via `rails console`.
- CSRF protection: Rails includes a CSRF meta tag in the layout. The React API client reads it and sends it as `X-CSRF-Token` header on non-GET requests.

**Why not JWT:** JWT requires token refresh logic, secure storage decisions (localStorage is XSS-vulnerable, httpOnly cookies negate JWT's advantages), and revocation complexity. For a local single-user dashboard, this is pure overhead.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 user (local) | Current architecture. Async ActionCable adapter. No Redis. SQLite could even work, but PostgreSQL is already specified. |
| 2-5 concurrent users | No changes needed. PostgreSQL and ActionCable async adapter handle this fine. |
| 10+ concurrent users | Switch ActionCable adapter from `async` to `redis` or `solid_cable` (Rails 8). Add connection pooling. Still a monolith. |
| Production/cloud deployment | Out of scope per PROJECT.md. Would need Redis for ActionCable, proper session store, HTTPS, env-based secrets. |

### Scaling Priorities

1. **First bottleneck (if it ever matters):** ActionCable async adapter is in-process only. If you ever need multiple Rails processes (Puma workers), switch to Redis adapter. For a local dashboard this will never be an issue.
2. **Second bottleneck:** Mock data generation hitting the DB on every broadcast. For a single user this is negligible. If simulating many agents, batch inserts and reduce broadcast frequency.

## Anti-Patterns

### Anti-Pattern 1: Managing Server Data in Zustand

**What people do:** Fetch API data, store it in a Zustand store, manually track loading/error states, forget to refresh stale data.
**Why it's wrong:** You end up reimplementing what TanStack Query does automatically -- caching, background refetch, deduplication, stale tracking, error retries. Your dashboard shows stale data because nothing triggers a refetch after the initial load.
**Do this instead:** Use TanStack Query for all server-derived state. Use Zustand only for client-local state (UI toggles, filter selections, modal visibility).

### Anti-Pattern 2: WebSocket as Primary Data Source

**What people do:** Send full data payloads over WebSocket and render directly from WebSocket messages, bypassing REST APIs entirely.
**Why it's wrong:** WebSocket connections drop, messages can arrive out of order, and you have no cache layer. When a user navigates away and back, there is no data until the next WS push. You also lose the ability to do initial page loads without waiting for a push.
**Do this instead:** REST API is the primary data source (via TanStack Query). WebSocket messages trigger cache invalidation, not direct rendering. The REST API is always the source of truth.

### Anti-Pattern 3: Fat Controllers, No Service Layer

**What people do:** Put mock data generation, business logic, and broadcasting all inside Rails controllers.
**Why it's wrong:** When the Gateway integration arrives, you must rewrite every controller. Mock logic is tangled with request handling. Controllers become untestable.
**Do this instead:** Controllers call service objects. The service interface stays the same whether data comes from mocks or the Gateway. Controllers handle HTTP concerns only (params, auth, response codes).

### Anti-Pattern 4: One Giant ActionCable Channel

**What people do:** Create a single `UpdatesChannel` that broadcasts everything -- agent changes, task updates, approvals, KPIs.
**Why it's wrong:** Every connected client processes every message, even for screens they are not viewing. Parsing message types client-side adds complexity. Cannot subscribe/unsubscribe per-screen.
**Do this instead:** One channel per domain concern (DashboardChannel, AgentChannel, TaskChannel, ApprovalChannel). React components subscribe only to the channel relevant to their current screen. Unsubscribe on unmount.

### Anti-Pattern 5: Tightly Coupling React Components to API Shape

**What people do:** Directly spread API response JSON into component props. When the API changes, components break.
**Why it's wrong:** API responses (jbuilder views) and component props should be independent contracts. API shapes may use snake_case; React components expect camelCase. API may include data a component does not need.
**Do this instead:** Define TypeScript types for both API responses and component props. Transform data in hooks or a thin mapping layer. Components never import from `api/`.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| OpenClaw Gateway (future) | WebSocket client from Rails (not browser) | Rails backend connects to `ws://127.0.0.1:18789` as a client. Receives events, persists to DB, broadcasts to React via ActionCable. The browser never talks to the Gateway directly. |
| OpenClaw Filesystem (future) | File reads from Rails backend | `~/.openclaw/openclaw.json` for agent config, `~/.openclaw/agents/*/sessions/*.jsonl` for usage data. Rails service reads and parses these; React never touches the filesystem. |
| PostgreSQL | ActiveRecord ORM | Docker container on port 5411. All persistent state: agents, tasks, approvals, usage snapshots, settings, users. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| React SPA <-> Rails API | HTTP REST (JSON) + ActionCable (WebSocket) | All communication goes through `/api/v1/*` endpoints and `/cable`. No direct model access from frontend. |
| Controllers <-> Services | Direct Ruby method calls | Controllers instantiate service objects and call methods. Services return plain data; controllers render via jbuilder. |
| Services <-> Models | ActiveRecord queries | Services use AR scopes and queries. Models own validations, associations, and DB-level concerns. |
| ActionCable <-> TanStack Query | Cache invalidation pattern | WS messages carry event type only (e.g., `{ type: "task_updated" }`). React hooks invalidate relevant query keys. No data payload duplication. |
| Mock Layer <-> Real Layer (future) | Service interface swap | Both `MockDataService` and future `GatewayService` implement the same method signatures. Controller code does not change. |

## Build Order Implications

The architecture has clear dependency layers that dictate build order:

### Phase 1: Foundation (must come first)
- Rails app scaffolding in `source/dashboard` (rails new, vite_rails, Devise, Tailwind)
- Database schema and models (Agent, Task, Approval, UsageSnapshot, Setting, User)
- Devise authentication (User model, session controller, login view)
- SPA catch-all route + React mount point
- This phase produces a running Rails + React app with auth but no real screens.

### Phase 2: Design System + App Shell (depends on Phase 1)
- Tailwind theme configuration (dark mode colors, fonts from spec)
- UI component library (Card, Badge, Button, StatusDot, KpiCard, DataTable, Modal)
- App shell layout (Sidebar, TopNav, Breadcrumb) with React Router nested routes
- All 6 sidebar navigation items routing to placeholder pages
- This phase produces the persistent chrome that every screen lives inside.

### Phase 3: Mock Data + API Layer (depends on Phase 1 models)
- MockDataService with seed data for all entity types
- API v1 controllers + jbuilder views for all resources
- TanStack Query hooks + API client functions on the React side
- Seed task (`db:seed`) that populates realistic mock data
- This phase produces the data pipeline from DB to React, with no real screens yet but all data accessible via API.

### Phase 4: Screens (depends on Phase 2 shell + Phase 3 data)
- Build screens in dependency order:
  1. **Dashboard** -- uses KpiCard, DataTable, timeline (composes most component types)
  2. **Agent Fleet** -- grid/table toggle, agent cards, filters
  3. **Task Board** -- Kanban columns, drag-and-drop, New Task modal
  4. **Approvals** -- expandable cards, approve/deny actions, history tab
  5. **Usage** -- charts (Recharts), KPI cards, time period selector, export
  6. **Settings** -- form fields, tabs, save/discard
  7. **Global Search** -- cross-entity search results

### Phase 5: Real-Time Layer (depends on Phase 4 screens being functional)
- ActionCable channels (Dashboard, Agent, Task, Approval)
- `useChannel` React hook + cache invalidation wiring
- MockBroadcastJob that simulates real-time events
- Notification store + notification bell updates

### Why This Order

- **Foundation first** because everything depends on a running Rails + React app with auth.
- **Design system before screens** because building screens without a component library means either building components ad-hoc (inconsistent) or blocking screen work while you build components. Upfront component investment pays off across all 7 screens.
- **Mock data + API before screens** because screens need data to render. Building screens with hardcoded data means rewriting them when the API exists.
- **Real-time last** because it is an enhancement layer over already-working screens. Every screen must function correctly with polling/manual refresh before adding WebSocket push. This also keeps the most complex integration (ActionCable + React + cache invalidation) isolated to one phase.

## Sources

- [Action Cable Overview -- Ruby on Rails Guides](https://guides.rubyonrails.org/action_cable_overview.html)
- [Rails Integration | Vite Ruby](https://vite-ruby.netlify.app/guide/rails.html)
- [TanStack Query Overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Router v7 Guide](https://reactrouter.com/upgrading/v6)
- [Rails Session Cookies for API Authentication](https://pragmaticstudio.com/tutorials/rails-session-cookies-for-api-authentication)
- [Zustand vs Redux: State Management Comparison](https://medium.com/@msmt0452/zustand-vs-redux-toolkit-the-complete-guide-to-state-management-in-react-4dce420741b4)
- [React State Management in 2025](https://www.developerway.com/posts/react-state-management-2025)
- [Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/)
- [Using ReactJS with Rails ActionCable](https://www.bigbinary.com/blog/using-reactjs-with-rails-actioncable)
- [Ruby on Rails with React: Why This Stack Still Works in 2026](https://rubyroidlabs.com/blog/2023/11/how-to-use-ruby-on-rails-with-react-in-2024/)

---
*Architecture research for: OpenClaw Team Manager (AI Agent Dashboard)*
*Researched: 2026-03-25*
