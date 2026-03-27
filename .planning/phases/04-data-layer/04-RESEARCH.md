# Phase 4: Data Layer - Research

**Researched:** 2026-03-26
**Domain:** Rails API + React data fetching pipeline (models, seeds, REST endpoints, React hooks)
**Confidence:** HIGH

## Summary

Phase 4 builds the complete data pipeline from PostgreSQL models through Rails API endpoints to React hooks. The codebase already has: Rails 8.0.5 with UUID primary keys, Devise session auth, Zustand for UI state, existing page components with placeholder skeletons, and all required gems (pagy 9.4.0, pundit 2.5.2, rack-cors 2.0.2, jbuilder 2.14.1) installed in the bundle.

The core technical work involves: (1) five new ActiveRecord models with migrations, (2) a service layer abstraction between controllers and models, (3) jbuilder-serialized REST endpoints under `/api/v1/` with pagy pagination, (4) seed data with Faker, and (5) TanStack React Query hooks that consume the API. The API controllers should inherit from `ApplicationController` (not `ActionController::API`) to maintain Devise session-based auth and CSRF protection -- the SPA already has `getCsrfToken()` in `lib/csrf.ts`.

**Primary recommendation:** Build bottom-up: models and migrations first, then services, then controllers+jbuilder views, then seeds, then React hooks. Keep API controllers session-aware (inherit ApplicationController). Use pagy's `data_hash` method for embedding pagination metadata in JSON responses.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01 through D-03: Agent model with dedicated columns (name, agent_id, status enum, model_name, workspace, uptime_since), UUID PKs, has_many associations
- D-04 through D-07: Task model with string enum status (6 Kanban columns), integer priority (0-3), display task_id string, title+description+agent FK
- D-08 through D-12: Approval model with approval_type enum, status enum, risk_level enum, JSONB context, timestamps+resolved_by FK
- D-13 through D-14: UsageRecord per agent per hour with token counts, cost_cents integer, model_name, recorded_at; dashboard aggregates via SQL GROUP BY
- D-15 through D-16: Setting model as key-value with key (string, unique) + value (jsonb), dot notation keys
- D-17 through D-19: Per-resource service objects in app/services/ wrapping ActiveRecord; controllers never touch models directly
- D-20 through D-22: Busy fleet seed data (6 agents, ~35 tasks, ~12 approvals, 7 days hourly usage records) with OpenClaw-themed names
- D-23 through D-29: REST API under /api/v1/ with jbuilder, filtering, pagy pagination, sort support, date range on usage, flat response shape, approve/deny actions
- D-30 through D-32: TanStack Query for server state, custom hooks per resource, Zustand for UI-only state

### Claude's Discretion
- Exact jbuilder view structure and partials
- React Query cache/stale time configuration
- Zustand store organization (single store vs per-concern)
- Service method signatures beyond list/find/create/update
- Database index strategy

### Deferred Ideas (OUT OF SCOPE)
- ActionCable WebSocket channels for real-time agent updates (Phase 5+)
- Global search via pg_search (separate phase)
- Optimistic updates for approve/deny (UI feature phases)
- Task drag-and-drop reordering within Kanban columns (Task Board phase)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Mock data service abstraction -- controllers call service objects, swappable for real Gateway later | Service layer pattern (D-17..D-19): per-resource service classes in `app/services/`, consistent interface methods. See Architecture Patterns section. |
| DATA-02 | Seed data with realistic agents, tasks, approvals, and usage metrics (Faker-generated) | Seed data design (D-20..D-22): 6 agents, ~35 tasks, ~12 approvals, 7 days hourly usage. Faker gem already in Gemfile. See Code Examples section. |
| DATA-03 | REST API endpoints under `/api/v1/` with jbuilder serialization for all resources | API design (D-23..D-29): namespaced routes, jbuilder views, pagy pagination, filtering, sorting. See Architecture Patterns and Code Examples. |
| DATA-04 | React state management -- TanStack Query for server state, Zustand for UI state | React data layer (D-30..D-32): TanStack Query custom hooks, Zustand UI stores. TanStack Query must be installed (npm). See Code Examples. |
| DATA-05 | Database schema with models for agents, tasks, approvals, usage records, settings | Schema design (D-01..D-16): five models with enums, JSONB, FKs, UUID PKs. Migrations follow existing pattern. See Standard Stack and Architecture Patterns. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **App location**: All Rails code in `source/dashboard`
- **Serialization**: jbuilder only -- do NOT use active_model_serializers
- **Auth**: Devise session-based -- API controllers must respect session auth
- **Database**: PostgreSQL 17 in Docker on port 5411
- **Testing**: RSpec, Factory Bot, Faker, RuboCop
- **Frontend**: TypeScript, Vite, React 19, Tailwind v4
- **No Redis**: Solid Cable uses PostgreSQL for ActionCable
- **No axios**: Use native fetch + React Query
- **Schema format**: structure.sql (not schema.rb)
- **UUID PKs**: All models use UUID primary keys (generator config confirmed)

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Confirmed |
|---------|---------|---------|-----------|
| Rails | 8.0.5 | API backend | `rails --version` |
| jbuilder | 2.14.1 | JSON serialization | `bundle exec gem list` |
| pagy | 9.4.0 | Pagination | `bundle exec gem list` |
| pundit | 2.5.2 | Authorization policies | `bundle exec gem list` |
| rack-cors | 2.0.2 | CORS middleware | `bundle exec gem list` |
| faker | 3.6.x | Seed data generation | In Gemfile |
| factory_bot_rails | 6.5.1 | Test factories | In Gemfile |
| zustand | 5.0.12 | Client UI state | In package.json |
| react-router | 7.13.2 | Client routing | In package.json |

### To Install (npm)

| Library | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-query | ^5.95.2 | Server state management |
| @tanstack/react-query-devtools | ^5.95.2 | Dev tools for React Query |
| date-fns | ^4.1.0 | Date formatting for timestamps |

**Installation:**
```bash
cd source/dashboard
npm install @tanstack/react-query @tanstack/react-query-devtools date-fns
```

**No additional gems needed.** All required gems (pagy, pundit, jbuilder, faker, rack-cors) are already in the Gemfile and bundled.

## Architecture Patterns

### Recommended Project Structure (New Files)

```
source/dashboard/
  app/
    controllers/
      api/
        v1/
          base_controller.rb      # API base: auth, pagination, error handling
          agents_controller.rb
          tasks_controller.rb
          approvals_controller.rb
          usage_controller.rb
          dashboard_controller.rb
          settings_controller.rb
    models/
      agent.rb
      task.rb
      approval.rb
      usage_record.rb
      setting.rb
    services/
      agent_service.rb
      task_service.rb
      approval_service.rb
      usage_service.rb
      dashboard_service.rb
      settings_service.rb
    views/
      api/
        v1/
          agents/
            index.json.jbuilder
            show.json.jbuilder
            _agent.json.jbuilder
          tasks/
            index.json.jbuilder
            show.json.jbuilder
            _task.json.jbuilder
          approvals/
            index.json.jbuilder
            show.json.jbuilder
            _approval.json.jbuilder
          usage/
            index.json.jbuilder
          dashboard/
            show.json.jbuilder
          settings/
            index.json.jbuilder
            show.json.jbuilder
  db/
    migrate/
      XXXX_create_agents.rb
      XXXX_create_tasks.rb
      XXXX_create_approvals.rb
      XXXX_create_usage_records.rb
      XXXX_create_settings.rb
    seeds.rb
  spec/
    models/
      agent_spec.rb
      task_spec.rb
      approval_spec.rb
      usage_record_spec.rb
      setting_spec.rb
    services/
      agent_service_spec.rb
      task_service_spec.rb
      approval_service_spec.rb
      usage_service_spec.rb
    requests/
      api/
        v1/
          agents_spec.rb
          tasks_spec.rb
          approvals_spec.rb
          usage_spec.rb
          dashboard_spec.rb
          settings_spec.rb
    factories/
      agents.rb
      tasks.rb
      approvals.rb
      usage_records.rb
      settings.rb
  app/frontend/
    lib/
      api.ts                     # Shared fetch wrapper with CSRF + JSON headers
    hooks/
      useAgents.ts
      useTasks.ts
      useApprovals.ts
      useUsage.ts
      useDashboard.ts
      useSettings.ts
    types/
      api.ts                     # TypeScript types matching API response shapes
    stores/
      uiStore.ts                 # Already exists -- extend with filters, view toggles
```

### Pattern 1: API Base Controller (Session-Aware)

**What:** A base controller for all `/api/v1/` endpoints that inherits from `ApplicationController` (NOT `ActionController::API`) to maintain Devise session auth and CSRF protection.

**Why:** The React SPA is served by the same Rails app and uses session cookies for auth. Using `ActionController::API` would lose session access. The SPA already includes CSRF meta tags and has `getCsrfToken()` in `lib/csrf.ts`.

**Example:**
```ruby
# app/controllers/api/v1/base_controller.rb
module Api
  module V1
    class BaseController < ApplicationController
      include Pagy::Backend

      before_action :authenticate_user!

      # Skip layout rendering for JSON responses
      layout false

      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActiveRecord::RecordInvalid, with: :unprocessable

      private

      def not_found
        render json: { error: "Not found" }, status: :not_found
      end

      def unprocessable(exception)
        render json: { error: exception.record.errors.full_messages },
               status: :unprocessable_entity
      end

      def pagination_meta(pagy)
        {
          current_page: pagy.page,
          per_page: pagy.limit,
          total_pages: pagy.pages,
          total_count: pagy.count
        }
      end
    end
  end
end
```

### Pattern 2: Service Layer Abstraction

**What:** Per-resource service objects that wrap ActiveRecord queries. Controllers call services, never models directly.

**Why:** Decision D-17..D-19 -- enables future Gateway swap without changing controllers.

**Example:**
```ruby
# app/services/agent_service.rb
class AgentService
  def self.list(filters: {}, sort: nil, dir: "asc")
    scope = Agent.all
    scope = scope.where(status: filters[:status]) if filters[:status].present?
    scope = apply_sort(scope, sort, dir)
    scope
  end

  def self.find(id)
    Agent.find(id)
  end

  def self.create(params)
    Agent.create!(params)
  end

  def self.update(id, params)
    agent = Agent.find(id)
    agent.update!(params)
    agent
  end

  private_class_method def self.apply_sort(scope, sort, dir)
    return scope.order(created_at: :desc) unless sort
    direction = dir == "asc" ? :asc : :desc
    scope.order(sort => direction)
  end
end
```

### Pattern 3: jbuilder Views with Pagy Pagination

**What:** jbuilder templates render JSON with embedded pagination metadata via pagy's `data_hash`.

**Example:**
```ruby
# app/views/api/v1/agents/index.json.jbuilder
json.data do
  json.array! @agents, partial: "api/v1/agents/agent", as: :agent
end

json.pagination do
  json.current_page @pagy.page
  json.per_page @pagy.limit
  json.total_pages @pagy.pages
  json.total_count @pagy.count
end
```

```ruby
# app/views/api/v1/agents/_agent.json.jbuilder
json.extract! agent, :id, :name, :agent_id, :status, :model_name, :workspace, :uptime_since
json.created_at agent.created_at.iso8601
json.updated_at agent.updated_at.iso8601
```

### Pattern 4: React Query Custom Hooks

**What:** Per-resource hooks using TanStack Query v5 with TypeScript.

**Example:**
```typescript
// hooks/useAgents.ts
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Agent, PaginatedResponse } from "@/types/api";

interface UseAgentsParams {
  status?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

export function useAgents(params: UseAgentsParams = {}) {
  return useQuery({
    queryKey: ["agents", params],
    queryFn: () => apiFetch<PaginatedResponse<Agent>>("/api/v1/agents", params),
    staleTime: 30_000,  // 30 seconds before refetch
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ["agents", id],
    queryFn: () => apiFetch<Agent>(`/api/v1/agents/${id}`),
    enabled: !!id,
  });
}
```

### Pattern 5: Shared API Fetch Wrapper

**What:** A typed fetch utility that handles CSRF tokens, JSON headers, and error responses.

**Why:** All API calls from React need CSRF token (from existing `getCsrfToken()`), JSON content type, and consistent error handling. This wrapper is used by all hooks.

**Example:**
```typescript
// lib/api.ts
import { getCsrfToken } from "./csrf";

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`API error ${status}`);
  }
}

export async function apiFetch<T>(
  path: string,
  params?: Record<string, unknown>,
  options?: RequestInit
): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-CSRF-Token": getCsrfToken(),
    },
    credentials: "same-origin",
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.json().catch(() => null));
  }

  return response.json();
}
```

### Pattern 6: Zustand Store Extension

**What:** Extend the existing `uiStore.ts` with filter and view toggle state, or create per-concern stores.

**Recommendation:** Create separate stores per concern for clarity. The existing `uiStore` handles sidebar; add `filterStore` for page-level filters and `viewStore` for view toggles.

**Example:**
```typescript
// stores/filterStore.ts
import { create } from "zustand";

interface FilterState {
  agentFilters: { status?: string; model?: string };
  taskFilters: { status?: string; priority?: number; agentId?: string };
  approvalFilters: { riskLevel?: string; status?: string };
  usageTimeRange: "1h" | "6h" | "24h" | "7d" | "30d";
  setAgentFilters: (filters: Partial<FilterState["agentFilters"]>) => void;
  setTaskFilters: (filters: Partial<FilterState["taskFilters"]>) => void;
  setApprovalFilters: (filters: Partial<FilterState["approvalFilters"]>) => void;
  setUsageTimeRange: (range: FilterState["usageTimeRange"]) => void;
}
```

### Anti-Patterns to Avoid

- **Inheriting from ActionController::API for API controllers:** Loses Devise session auth. This app is an SPA served by Rails -- session cookies travel with every request. Use `ApplicationController` as the base.
- **Storing server state in Zustand:** TanStack Query handles all server state (caching, refetching, staleness). Zustand is for UI-only state (sidebar, filters, view toggles).
- **Using `axios`:** CLAUDE.md explicitly forbids it. Use native `fetch` wrapped in the shared `apiFetch` utility.
- **Pre-aggregating usage data in separate tables:** Decision D-14 says aggregate via SQL GROUP BY. No summary tables.
- **Nested associations in API responses:** Decision D-28 says flat responses with FK IDs and denormalized convenience fields (like `agent_name`).
- **Using active_model_serializers:** CLAUDE.md forbids it. jbuilder only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pagination | Custom LIMIT/OFFSET logic | Pagy 9.4.0 `pagy()` method | Edge cases with count queries, overflow pages, metadata serialization |
| CSRF token handling | Manual token extraction | Existing `getCsrfToken()` from `lib/csrf.ts` | Already implemented and working |
| Server state caching | Custom cache in Zustand/useState | TanStack React Query | Handles stale-while-revalidate, background refetch, cache invalidation |
| UUID generation | Manual UUID column config | Rails generator `primary_key_type: :uuid` | Already configured in `config/initializers/generators.rb` |
| Date formatting | Manual date string manipulation | `date-fns` format/formatDistance | Locale-aware, handles "2h ago", "Just now" edge cases |
| Query parameter serialization | Manual URL building | Shared `apiFetch` utility | Consistent encoding, type coercion, null handling |

**Key insight:** The infrastructure for this phase is almost entirely in place (gems installed, Zustand running, CSRF helper ready). The work is wiring it all together, not installing new tooling (aside from the three npm packages).

## Common Pitfalls

### Pitfall 1: CSRF Mismatch on Non-GET API Requests
**What goes wrong:** POST/PATCH/DELETE requests to `/api/v1/` fail with 422 Unprocessable Entity because CSRF token isn't included.
**Why it happens:** API controllers inherit from `ApplicationController` which has `protect_from_forgery`. The React fetch call doesn't include the `X-CSRF-Token` header.
**How to avoid:** The shared `apiFetch` utility MUST include `"X-CSRF-Token": getCsrfToken()` in all request headers and `credentials: "same-origin"` to send session cookies.
**Warning signs:** 422 errors on any non-GET API request; `ActionController::InvalidAuthenticityToken` in Rails logs.

### Pitfall 2: Pagy Count Query on Complex Scopes
**What goes wrong:** `pagy()` calls `count(:all)` on the scope, which can fail or be slow with complex joins/GROUP BY.
**Why it happens:** Pagy auto-counts by default, which generates a COUNT query. Usage records with GROUP BY aggregation conflicts with this.
**How to avoid:** For the usage endpoint (which uses GROUP BY for time-series), use `pagy(:offset, scope, count: pre_calculated_count)` or avoid pagy on aggregated endpoints entirely (usage returns time-series data, not a paginated list).
**Warning signs:** SQL errors on the usage endpoint; unexpectedly slow pagination queries.

### Pitfall 3: Enum String Values vs ActiveRecord Enum
**What goes wrong:** Using Rails `enum` macro with integer backing when the decisions specify string enum values.
**Why it happens:** Rails `enum` traditionally maps to integers. The decisions (D-04, D-08, D-09, D-10) specify string-based enums.
**How to avoid:** In Rails 8, use `enum :status, { ... }` with a string column type. Define the column as `string` in the migration and use ActiveRecord enum with explicit string values: `enum :status, { backlog: "backlog", queued: "queued", ... }`.
**Warning signs:** Integer values in the database instead of human-readable strings; API responses showing numbers instead of status names.

### Pitfall 4: Missing Foreign Key Index on Usage Records
**What goes wrong:** Dashboard and usage page queries are slow because they filter/GROUP BY agent_id on a table with ~1,008 seed records (and potentially more in production).
**Why it happens:** Forgetting to add composite indexes on `(agent_id, recorded_at)` for the usage_records table.
**How to avoid:** Add a composite index: `add_index :usage_records, [:agent_id, :recorded_at]`. Also index `recorded_at` alone for date-range queries.
**Warning signs:** Slow usage endpoint; full table scans in EXPLAIN output.

### Pitfall 5: TanStack Query Provider Not Wrapped Around Router
**What goes wrong:** React Query hooks throw "No QueryClient set" error.
**Why it happens:** `QueryClientProvider` must wrap the entire React tree. The current `App.tsx` only renders `RouterProvider`.
**How to avoid:** Wrap `RouterProvider` with `QueryClientProvider` in `App.tsx`. Add `ReactQueryDevtools` in development.
**Warning signs:** Runtime error "No QueryClient set, use QueryClientProvider to set one".

### Pitfall 6: jbuilder View Path Must Match Controller Namespace
**What goes wrong:** Rails can't find the jbuilder template and returns a 204 No Content or raises a template missing error.
**Why it happens:** Controller is in `Api::V1::AgentsController` but the view path doesn't match `app/views/api/v1/agents/`.
**How to avoid:** jbuilder views MUST be at `app/views/api/v1/<resource>/<action>.json.jbuilder`. The folder structure must exactly match the controller namespace.
**Warning signs:** MissingTemplate errors; 204 responses instead of JSON.

### Pitfall 7: Seed Data Idempotency
**What goes wrong:** Running `rails db:seed` twice creates duplicate data.
**Why it happens:** Seeds use `create!` without checking for existing records.
**How to avoid:** Use `find_or_create_by!` for agents and settings (which have unique identifiers). For tasks/approvals/usage_records, either clear first (`Agent.destroy_all` cascading) or wrap in an idempotency check.
**Warning signs:** Doubled seed data; uniqueness constraint violations on second seed run.

## Code Examples

### Migration: Agents Table
```ruby
# db/migrate/XXXX_create_agents.rb
class CreateAgents < ActiveRecord::Migration[8.0]
  def change
    create_table :agents, id: :uuid do |t|
      t.string :name, null: false
      t.string :agent_id, null: false   # External ID (e.g., "agt_001x")
      t.string :status, null: false, default: "idle"
      t.string :model_name                # e.g., "opus", "sonnet"
      t.string :workspace
      t.datetime :uptime_since

      t.timestamps
    end

    add_index :agents, :agent_id, unique: true
    add_index :agents, :status
  end
end
```

### Migration: Tasks Table
```ruby
class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks, id: :uuid do |t|
      t.string :task_id, null: false     # Display ID like "TASK-001"
      t.string :title, null: false
      t.text :description
      t.string :status, null: false, default: "backlog"
      t.integer :priority, null: false, default: 2  # 0=P0, 1=P1, 2=P2, 3=P3
      t.references :agent, type: :uuid, foreign_key: true

      t.timestamps
    end

    add_index :tasks, :task_id, unique: true
    add_index :tasks, :status
    add_index :tasks, :priority
  end
end
```

### Migration: Approvals Table
```ruby
class CreateApprovals < ActiveRecord::Migration[8.0]
  def change
    create_table :approvals, id: :uuid do |t|
      t.string :title, null: false
      t.text :description
      t.string :approval_type, null: false  # dangerous_command, sensitive_data, budget_override
      t.string :status, null: false, default: "pending"
      t.string :risk_level, null: false, default: "medium"
      t.jsonb :context, default: {}
      t.datetime :requested_at, null: false
      t.datetime :resolved_at
      t.references :agent, type: :uuid, foreign_key: true
      t.references :resolved_by, type: :uuid, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :approvals, :approval_type
    add_index :approvals, :status
    add_index :approvals, :risk_level
  end
end
```

### Migration: Usage Records Table
```ruby
class CreateUsageRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :usage_records, id: :uuid do |t|
      t.references :agent, type: :uuid, null: false, foreign_key: true
      t.integer :input_tokens, null: false, default: 0
      t.integer :output_tokens, null: false, default: 0
      t.integer :api_calls, null: false, default: 0
      t.integer :cost_cents, null: false, default: 0
      t.string :model_name
      t.datetime :recorded_at, null: false

      t.timestamps
    end

    add_index :usage_records, [:agent_id, :recorded_at]
    add_index :usage_records, :recorded_at
  end
end
```

### Migration: Settings Table
```ruby
class CreateSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :settings, id: :uuid do |t|
      t.string :key, null: false
      t.jsonb :value, default: {}

      t.timestamps
    end

    add_index :settings, :key, unique: true
  end
end
```

### Model: Agent with String Enum
```ruby
# app/models/agent.rb
class Agent < ApplicationRecord
  enum :status, {
    active: "active",
    idle: "idle",
    error: "error",
    disabled: "disabled"
  }

  has_many :tasks, dependent: :nullify
  has_many :approvals, dependent: :destroy
  has_many :usage_records, dependent: :destroy

  validates :name, presence: true
  validates :agent_id, presence: true, uniqueness: true
  validates :status, presence: true
end
```

### Model: Task with String Enum and Integer Priority
```ruby
# app/models/task.rb
class Task < ApplicationRecord
  enum :status, {
    backlog: "backlog",
    queued: "queued",
    in_progress: "in_progress",
    awaiting_approval: "awaiting_approval",
    completed: "completed",
    failed: "failed"
  }

  belongs_to :agent, optional: true

  validates :task_id, presence: true, uniqueness: true
  validates :title, presence: true
  validates :status, presence: true
  validates :priority, presence: true,
            numericality: { only_integer: true, in: 0..3 }
end
```

### Pagy Configuration
```ruby
# config/initializers/pagy.rb
Pagy::DEFAULT[:limit] = 25    # Default items per page
Pagy::DEFAULT[:max_limit] = 100  # Maximum allowed per_page
```

### Routes for API Namespace
```ruby
# config/routes.rb (additions)
namespace :api do
  namespace :v1 do
    resources :agents, only: [:index, :show, :create, :update]
    resources :tasks, only: [:index, :show, :create, :update]
    resources :approvals, only: [:index, :show] do
      member do
        patch :approve
        patch :deny
      end
    end
    resources :usage, only: [:index]
    resource :dashboard, only: [:show]
    resources :settings, only: [:index, :show, :update], param: :key
  end
end
```

### TypeScript API Types
```typescript
// types/api.ts
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface Agent {
  id: string;
  name: string;
  agent_id: string;
  status: "active" | "idle" | "error" | "disabled";
  model_name: string | null;
  workspace: string | null;
  uptime_since: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  task_id: string;
  title: string;
  description: string | null;
  status: "backlog" | "queued" | "in_progress" | "awaiting_approval" | "completed" | "failed";
  priority: 0 | 1 | 2 | 3;
  agent_id: string | null;
  agent_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  title: string;
  description: string | null;
  approval_type: "dangerous_command" | "sensitive_data" | "budget_override";
  status: "pending" | "approved" | "denied";
  risk_level: "low" | "medium" | "high" | "critical";
  context: Record<string, unknown>;
  requested_at: string;
  resolved_at: string | null;
  agent_id: string | null;
  agent_name: string | null;
  resolved_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  agent_id: string;
  agent_name: string;
  input_tokens: number;
  output_tokens: number;
  api_calls: number;
  cost_cents: number;
  model_name: string | null;
  recorded_at: string;
}

export interface UsageSummary {
  total_tokens: number;
  total_api_calls: number;
  total_cost_cents: number;
  avg_latency_ms: number | null;
  records: UsageRecord[];
}

export interface DashboardData {
  active_agents: number;
  tasks_in_progress: number;
  pending_approvals: number;
  tokens_used_24h: number;
  cost_24h_cents: number;
  recent_tasks: Task[];
  pending_approval_items: Approval[];
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
}
```

### QueryClient Setup in App.tsx
```typescript
// components/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router";
import { router } from "@/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // 30s -- dashboard data refreshes frequently
      gcTime: 5 * 60_000,     // 5min garbage collection
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Seed Data Pattern
```ruby
# db/seeds.rb (pattern)
return if Agent.exists?  # Idempotency guard

agents_data = [
  { name: "docs-writer", agent_id: "agt_docs01", status: "active", model_name: "opus", workspace: "~/projects/docs" },
  { name: "code-reviewer", agent_id: "agt_code01", status: "active", model_name: "sonnet", workspace: "~/projects/api" },
  { name: "test-runner", agent_id: "agt_test01", status: "active", model_name: "sonnet", workspace: "~/projects/tests" },
  { name: "deploy-bot", agent_id: "agt_depl01", status: "idle", model_name: "opus", workspace: "~/projects/infra" },
  { name: "data-analyzer", agent_id: "agt_data01", status: "error", model_name: "opus", workspace: "~/projects/analytics" },
  { name: "legacy-migrator", agent_id: "agt_legc01", status: "disabled", model_name: "sonnet", workspace: "~/projects/legacy" },
]

agents = agents_data.map { |data| Agent.create!(data.merge(uptime_since: rand(1..7).days.ago)) }
# ... tasks, approvals, usage records follow
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Rails `enum status: [...]` (integer) | `enum :status, { key: "string_value" }` (string column) | Rails 7.2+ | String values readable in DB, no integer mapping confusion |
| `kaminari` / `will_paginate` | `pagy` | 2020+ | 10-40x faster pagination, lower memory |
| `active_model_serializers` | `jbuilder` (project constraint) | AMS unmaintained since ~2021 | jbuilder ships with Rails, actively maintained |
| Separate API app (`ActionController::API`) | Session-aware API controllers in same app | N/A (architecture choice) | SPA + API in one app, shared session auth |
| Redux for all state | TanStack Query (server) + Zustand (UI) | 2023+ | Clear separation of concerns, less boilerplate |
| Custom fetch hooks | TanStack React Query v5 | 2024+ | Built-in caching, deduplication, background refetch |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | RSpec 8.0.x + Factory Bot 6.5.1 |
| Config file | `source/dashboard/spec/rails_helper.rb` |
| Quick run command | `cd source/dashboard && bundle exec rspec spec/models spec/services --format progress` |
| Full suite command | `cd source/dashboard && bundle exec rspec --format progress` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-05 | Models have correct validations, enums, associations | unit (model) | `bundle exec rspec spec/models/agent_spec.rb spec/models/task_spec.rb spec/models/approval_spec.rb spec/models/usage_record_spec.rb spec/models/setting_spec.rb -x` | Wave 0 |
| DATA-01 | Service objects wrap model queries correctly | unit (service) | `bundle exec rspec spec/services/ -x` | Wave 0 |
| DATA-03 | API endpoints return correct JSON with pagination | request | `bundle exec rspec spec/requests/api/v1/ -x` | Wave 0 |
| DATA-02 | Seeds create expected data | integration | `bundle exec rails db:seed RAILS_ENV=test` (manual verify) | manual-only (seeds are run once) |
| DATA-04 | React hooks fetch from API (TypeScript compiles) | compile check | `cd source/dashboard && npx tsc --noEmit` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd source/dashboard && bundle exec rspec spec/models spec/services spec/requests/api --format progress`
- **Per wave merge:** `cd source/dashboard && bundle exec rspec --format progress`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `spec/models/agent_spec.rb` -- covers DATA-05 (agent validations/enums)
- [ ] `spec/models/task_spec.rb` -- covers DATA-05 (task validations/enums)
- [ ] `spec/models/approval_spec.rb` -- covers DATA-05 (approval validations/enums)
- [ ] `spec/models/usage_record_spec.rb` -- covers DATA-05 (usage record validations)
- [ ] `spec/models/setting_spec.rb` -- covers DATA-05 (setting validations)
- [ ] `spec/services/` directory -- covers DATA-01 (service layer)
- [ ] `spec/requests/api/v1/` directory -- covers DATA-03 (API endpoints)
- [ ] `spec/factories/agents.rb` -- factory for agent test data
- [ ] `spec/factories/tasks.rb` -- factory for task test data
- [ ] `spec/factories/approvals.rb` -- factory for approval test data
- [ ] `spec/factories/usage_records.rb` -- factory for usage record test data
- [ ] `spec/factories/settings.rb` -- factory for setting test data

## Open Questions

1. **Pagy configuration file location**
   - What we know: Pagy 9.x uses `Pagy::DEFAULT` hash for configuration. No initializer exists yet.
   - What's unclear: Whether to create `config/initializers/pagy.rb` or configure inline.
   - Recommendation: Create `config/initializers/pagy.rb` with `Pagy::DEFAULT[:limit] = 25` and `Pagy::DEFAULT[:max_limit] = 100`. Standard Rails convention.

2. **Usage endpoint pagination vs. time-series aggregation**
   - What we know: Usage records are aggregated via GROUP BY per decision D-14. Pagy expects a standard ActiveRecord scope.
   - What's unclear: Whether to paginate the aggregated results or return all time-series data for the selected range.
   - Recommendation: For the usage endpoint, return time-series data without pagination (time-bounded by `from`/`to` params, typically <168 rows for 7 days hourly). Only paginate the raw usage records list if needed.

3. **Dashboard endpoint as single aggregate vs. multiple calls**
   - What we know: Dashboard needs active_agents count, tasks_in_progress count, pending_approvals count, tokens_used_24h, recent tasks, and pending approvals.
   - What's unclear: Single `/api/v1/dashboard` endpoint or let the React page call multiple endpoints.
   - Recommendation: Single `/api/v1/dashboard` endpoint that returns all KPI data. Reduces HTTP round trips and simplifies the `useDashboard` hook.

## Sources

### Primary (HIGH confidence)
- **Codebase inspection:** Verified all file paths, gem versions, model patterns, and frontend structure directly
- **Rails 8.0.5:** Confirmed via `rails --version` in project
- **Pagy 9.4.0:** Confirmed installed via `bundle exec gem list`
- **jbuilder 2.14.1:** Confirmed installed (note: CLAUDE.md says 3.0, actual is 2.14.1)
- **Zustand 5.0.12:** Confirmed in `package.json`
- **TanStack Query 5.95.2:** Verified via `npm view @tanstack/react-query version`

### Secondary (MEDIUM confidence)
- [Pagy official docs](https://ddnexus.github.io/pagy/) - Pagination API, `data_hash` method, configuration
- [TanStack Query v5 TypeScript docs](https://tanstack.com/query/v5/docs/framework/react/typescript) - Custom hooks pattern, queryOptions API
- [Rails API controller patterns](https://api.rubyonrails.org/classes/ActionController/API.html) - Namespace conventions, base controller pattern

### Tertiary (LOW confidence)
- Web search findings on Zustand v5 multiple stores pattern - Community consensus, not official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all verified from installed versions
- Architecture: HIGH - patterns follow Rails conventions with decisions locked
- Pitfalls: HIGH - identified from direct codebase analysis (CSRF setup, enum types, pagy behavior)
- Code examples: MEDIUM-HIGH - patterns verified against docs, exact API may differ in edge cases

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (30 days -- stable stack, no fast-moving dependencies)
