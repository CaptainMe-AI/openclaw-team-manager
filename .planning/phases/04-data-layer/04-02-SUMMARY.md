---
phase: 04-data-layer
plan: 02
subsystem: api
tags: [rails-api, jbuilder, pagy, service-objects, rest, pagination, filtering]

# Dependency graph
requires:
  - phase: 04-data-layer
    provides: Agent, Task, Approval, UsageRecord, Setting models with enums, validations, associations, Pagy config, factories
provides:
  - 6 service objects wrapping ActiveRecord queries (AgentService, TaskService, ApprovalService, UsageService, DashboardService, SettingsService)
  - API base controller with Devise session auth, Pagy pagination, error handling
  - 6 resource controllers under Api::V1 namespace (Agents, Tasks, Approvals, Usage, Dashboard, Settings)
  - 13 jbuilder views with flat response shape, FK IDs, denormalized agent_name
  - API routes under /api/v1/ with approve/deny member routes on approvals
  - 41 service specs and 29 request specs (70 total)
affects: [04-03, 05-react-hooks, 06-dashboard, 07-agents, 08-tasks, 09-approvals, 10-usage]

# Tech tracking
tech-stack:
  added: []
  patterns: [service-object-layer, controller-delegates-to-service, helper-method-for-jbuilder, flat-json-response-shape]

key-files:
  created:
    - source/dashboard/app/services/agent_service.rb
    - source/dashboard/app/services/task_service.rb
    - source/dashboard/app/services/approval_service.rb
    - source/dashboard/app/services/usage_service.rb
    - source/dashboard/app/services/dashboard_service.rb
    - source/dashboard/app/services/settings_service.rb
    - source/dashboard/app/controllers/api/v1/base_controller.rb
    - source/dashboard/app/controllers/api/v1/agents_controller.rb
    - source/dashboard/app/controllers/api/v1/tasks_controller.rb
    - source/dashboard/app/controllers/api/v1/approvals_controller.rb
    - source/dashboard/app/controllers/api/v1/usage_controller.rb
    - source/dashboard/app/controllers/api/v1/dashboard_controller.rb
    - source/dashboard/app/controllers/api/v1/settings_controller.rb
    - source/dashboard/app/views/api/v1/agents/_agent.json.jbuilder
    - source/dashboard/app/views/api/v1/agents/index.json.jbuilder
    - source/dashboard/app/views/api/v1/agents/show.json.jbuilder
    - source/dashboard/app/views/api/v1/tasks/_task.json.jbuilder
    - source/dashboard/app/views/api/v1/tasks/index.json.jbuilder
    - source/dashboard/app/views/api/v1/tasks/show.json.jbuilder
    - source/dashboard/app/views/api/v1/approvals/_approval.json.jbuilder
    - source/dashboard/app/views/api/v1/approvals/index.json.jbuilder
    - source/dashboard/app/views/api/v1/approvals/show.json.jbuilder
    - source/dashboard/app/views/api/v1/usage/index.json.jbuilder
    - source/dashboard/app/views/api/v1/dashboard/show.json.jbuilder
    - source/dashboard/app/views/api/v1/settings/index.json.jbuilder
    - source/dashboard/app/views/api/v1/settings/show.json.jbuilder
    - source/dashboard/spec/services/agent_service_spec.rb
    - source/dashboard/spec/services/task_service_spec.rb
    - source/dashboard/spec/services/approval_service_spec.rb
    - source/dashboard/spec/services/usage_service_spec.rb
    - source/dashboard/spec/requests/api/v1/agents_spec.rb
    - source/dashboard/spec/requests/api/v1/tasks_spec.rb
    - source/dashboard/spec/requests/api/v1/approvals_spec.rb
    - source/dashboard/spec/requests/api/v1/usage_spec.rb
    - source/dashboard/spec/requests/api/v1/dashboard_spec.rb
    - source/dashboard/spec/requests/api/v1/settings_spec.rb
  modified:
    - source/dashboard/config/routes.rb

key-decisions:
  - "Used helper_method to expose pagination_meta to jbuilder views (controller private methods not accessible in views)"
  - "Added route constraint for settings keys with dots (constraints: { key: /[^\\/]+/ }) to prevent Rails treating dots as format separators"
  - "Singular resource :dashboard with explicit controller: 'dashboard' to avoid Rails auto-pluralizing controller name"
  - "Used llm_model (not model_name) consistently per Plan 01 deviation"
  - "skip_before_action :allow_browser in API base controller to prevent browser version check on JSON requests"

patterns-established:
  - "Service object pattern: class methods (self.list, self.find, etc.) wrapping ActiveRecord queries"
  - "Controller-service delegation: controllers never reference model classes directly"
  - "Flat JSON response with pagination: { data: [...], pagination: { current_page, per_page, total_pages, total_count } }"
  - "Denormalized convenience fields: agent_name on task/approval JSON alongside agent_id FK"
  - "API base controller: Devise auth + Pagy + error rescue + sort/dir helpers"

requirements-completed: [DATA-01, DATA-03]

# Metrics
duration: 7min
completed: 2026-03-27
---

# Phase 04 Plan 02: Service Layer, API Controllers, jbuilder Views, and Request Specs Summary

**6 service objects, 7 controllers, 13 jbuilder views, and full API routes under /api/v1/ with 70 passing specs covering all endpoints including approve/deny workflows, filtering, pagination, and authentication**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-27T15:30:18Z
- **Completed:** 2026-03-27T15:38:09Z
- **Tasks:** 2
- **Files modified:** 39

## Accomplishments
- 6 service objects abstracting all ActiveRecord queries behind a clean interface for future Gateway swap
- 7 API controllers (1 base + 6 resource) under Api::V1 namespace with Devise session auth, Pagy pagination, and error handling
- 13 jbuilder views rendering flat JSON with FK IDs and denormalized convenience fields
- API routes under /api/v1/ with approve/deny member actions on approvals, settings with dot-notation key params
- 70 new specs (41 service + 29 request) all passing, 135 total specs pass with existing model specs

## Task Commits

Each task was committed atomically:

1. **Task 1: Service objects, API base controller, resource controllers, routes, and service specs** - `d1d9d74` (feat)
2. **Task 2: jbuilder views and request specs for all API endpoints** - `0a822ca` (feat)

## Files Created/Modified
- `source/dashboard/app/services/agent_service.rb` - Agent queries with status/llm_model filtering and sorting
- `source/dashboard/app/services/task_service.rb` - Task queries with status/priority/agent_id filtering
- `source/dashboard/app/services/approval_service.rb` - Approval queries with approve/deny workflow
- `source/dashboard/app/services/usage_service.rb` - Usage time-series queries with date range and summary aggregation
- `source/dashboard/app/services/dashboard_service.rb` - Dashboard KPI aggregation (counts, 24h usage totals, recent items)
- `source/dashboard/app/services/settings_service.rb` - Settings CRUD with key-based lookup
- `source/dashboard/app/controllers/api/v1/base_controller.rb` - API base with Pagy, Devise auth, error handling, pagination helper
- `source/dashboard/app/controllers/api/v1/agents_controller.rb` - CRUD via AgentService
- `source/dashboard/app/controllers/api/v1/tasks_controller.rb` - CRUD via TaskService
- `source/dashboard/app/controllers/api/v1/approvals_controller.rb` - List/show/approve/deny via ApprovalService
- `source/dashboard/app/controllers/api/v1/usage_controller.rb` - Time-series list via UsageService
- `source/dashboard/app/controllers/api/v1/dashboard_controller.rb` - Single KPI endpoint via DashboardService
- `source/dashboard/app/controllers/api/v1/settings_controller.rb` - List/show/update via SettingsService
- `source/dashboard/app/views/api/v1/agents/*.json.jbuilder` - Agent JSON views (partial, index, show)
- `source/dashboard/app/views/api/v1/tasks/*.json.jbuilder` - Task JSON views with agent_name
- `source/dashboard/app/views/api/v1/approvals/*.json.jbuilder` - Approval JSON views with agent_name, resolved_by
- `source/dashboard/app/views/api/v1/usage/index.json.jbuilder` - Usage time-series JSON
- `source/dashboard/app/views/api/v1/dashboard/show.json.jbuilder` - Dashboard KPI JSON with embedded tasks/approvals
- `source/dashboard/app/views/api/v1/settings/*.json.jbuilder` - Settings key-value JSON
- `source/dashboard/config/routes.rb` - API namespace with all routes before SPA catch-all
- `source/dashboard/spec/services/*.rb` - 4 service spec files (41 examples)
- `source/dashboard/spec/requests/api/v1/*.rb` - 6 request spec files (29 examples)

## Decisions Made
- **helper_method for pagination_meta:** Controller private methods are not accessible in jbuilder views. Exposed `pagination_meta` via `helper_method :pagination_meta` so views can call it directly.
- **Route constraint for dot-notation settings keys:** Rails interprets dots in URL params as format separators. Added `constraints: { key: /[^\/]+/ }` to settings routes to allow keys like `general.timezone`.
- **Explicit controller mapping for dashboard:** `resource :dashboard` (singular) auto-maps to `dashboards#show` (pluralized). Used `controller: 'dashboard'` to map to `Api::V1::DashboardController`.
- **skip_before_action :allow_browser:** The inherited `allow_browser versions: :modern` check from ApplicationController could reject API requests without browser User-Agent headers. Skipped in API base controller.
- **llm_model column name:** Consistently used `llm_model` (not `model_name`) per Plan 01 deviation for all service filters, jbuilder views, and controller params.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] pagination_meta unavailable in jbuilder views**
- **Found during:** Task 2 (jbuilder view creation)
- **Issue:** The plan specified calling `pagination_meta(@pagy)` in jbuilder index views, but jbuilder views cannot access controller private methods
- **Fix:** Added `helper_method :pagination_meta` to BaseController, exposing the method to views
- **Files modified:** source/dashboard/app/controllers/api/v1/base_controller.rb
- **Verification:** All request specs pass, pagination JSON rendered correctly
- **Committed in:** 0a822ca (Task 2 commit)

**2. [Rule 1 - Bug] Dashboard singular resource controller mapping**
- **Found during:** Task 2 (route verification)
- **Issue:** `resource :dashboard` maps to `dashboards#show` (Rails pluralizes controller name), but controller is `DashboardController` (singular)
- **Fix:** Added `controller: 'dashboard'` to the route declaration
- **Files modified:** source/dashboard/config/routes.rb
- **Verification:** `rails routes | grep dashboard` shows correct controller mapping
- **Committed in:** 0a822ca (Task 2 commit)

**3. [Rule 1 - Bug] Settings dot-notation keys treated as format parameter**
- **Found during:** Task 2 (settings request spec)
- **Issue:** GET /api/v1/settings/general.timezone returned 404 because Rails parsed `.timezone` as format extension
- **Fix:** Added `constraints: { key: /[^\/]+/ }` to settings route
- **Files modified:** source/dashboard/config/routes.rb
- **Verification:** Settings show/update specs pass with dot-notation keys
- **Committed in:** 0a822ca (Task 2 commit)

**4. [Rule 3 - Blocking] allow_browser check blocking API JSON requests**
- **Found during:** Task 2 (request specs)
- **Issue:** ApplicationController's `allow_browser versions: :modern` check could reject API requests
- **Fix:** Added `skip_before_action :allow_browser, raise: false` to BaseController
- **Files modified:** source/dashboard/app/controllers/api/v1/base_controller.rb
- **Verification:** All 29 request specs pass
- **Committed in:** 0a822ca (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (2 bugs, 2 blocking issues)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep. The plan's jbuilder view examples assumed controller method availability in views which is a common Rails misconception.

## Issues Encountered
- jbuilder views execute in a separate context from controllers, so private controller methods need `helper_method` to be accessible. This affected the pagination_meta helper used across all index views.
- Rails singular resource routing auto-pluralizes controller names, requiring explicit `controller:` option.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All API endpoints functional and tested (135 total specs pass)
- Service layer abstraction in place for future Gateway swap
- jbuilder views produce correct JSON shapes matching the planned React data layer interface
- Routes configured under /api/v1/ ready for React Query hooks to consume

## Self-Check: PASSED

All 13 key files verified present. Both commits (d1d9d74, 0a822ca) verified in git history.

---
*Phase: 04-data-layer*
*Completed: 2026-03-27*
