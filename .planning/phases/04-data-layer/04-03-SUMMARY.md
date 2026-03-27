---
phase: 04-data-layer
plan: 03
subsystem: frontend-data
tags: [tanstack-query, zustand, typescript, react-hooks, fetch-wrapper, csrf, filter-store, view-store]

# Dependency graph
requires:
  - phase: 04-data-layer
    provides: API endpoints under /api/v1/ with jbuilder views, Pagy pagination, Devise session auth
provides:
  - QueryClientProvider wrapping entire React tree with 30s stale, 5min gc, 1 retry defaults
  - ReactQueryDevtools for development-mode cache debugging
  - apiFetch utility with CSRF token, same-origin credentials, typed error handling
  - apiMutate convenience function for POST/PATCH/DELETE requests
  - TypeScript interfaces for all API response types (Agent, Task, Approval, UsageRecord, DashboardData, Setting)
  - 6 custom React Query hooks (useAgents, useTasks, useApprovals, useUsage, useDashboard, useSettings)
  - Approve/deny mutation hooks with automatic cache invalidation
  - Zustand filterStore for agent/task/approval filters and usage time range
  - Zustand viewStore for grid/table and board/list view toggles
affects: [05-dashboard, 06-agents, 07-tasks, 08-approvals, 09-usage, 10-settings]

# Tech tracking
tech-stack:
  added: [@tanstack/react-query, @tanstack/react-query-devtools, date-fns]
  patterns: [query-key-convention, hook-per-resource, zustand-ui-state, server-state-client-state-separation, typed-api-fetch]

key-files:
  created:
    - source/dashboard/app/frontend/types/api.ts
    - source/dashboard/app/frontend/lib/api.ts
    - source/dashboard/app/frontend/hooks/useAgents.ts
    - source/dashboard/app/frontend/hooks/useTasks.ts
    - source/dashboard/app/frontend/hooks/useApprovals.ts
    - source/dashboard/app/frontend/hooks/useUsage.ts
    - source/dashboard/app/frontend/hooks/useDashboard.ts
    - source/dashboard/app/frontend/hooks/useSettings.ts
    - source/dashboard/app/frontend/stores/filterStore.ts
    - source/dashboard/app/frontend/stores/viewStore.ts
  modified:
    - source/dashboard/app/frontend/components/App.tsx
    - source/dashboard/package.json
    - source/dashboard/package-lock.json

key-decisions:
  - "Used llm_model (not model_name) in TypeScript interfaces and filter params to match actual API field names per Plan 01 deviation"
  - "Used QueryParams type alias (Record<string, any>) in apiFetch to allow typed param interfaces in strict TypeScript mode"
  - "Dashboard hook uses 15s staleTime (vs global 30s) for more frequent KPI refresh"

patterns-established:
  - "Query key convention: ['resource', params] for lists, ['resource', id] for single items"
  - "Hook-per-resource: one file per API resource with list/detail/mutation hooks"
  - "Server state via React Query, UI state via Zustand -- clean separation"
  - "Mutation hooks invalidate related query keys on success (approvals invalidate dashboard)"
  - "apiFetch for reads, apiMutate for writes -- both include CSRF and credentials"

requirements-completed: [DATA-04]

# Metrics
duration: 3min
completed: 2026-03-27
---

# Phase 04 Plan 03: React Data Layer Summary

**TanStack Query provider with 6 typed resource hooks, apiFetch wrapper with CSRF/credentials, and Zustand filter/view stores bridging React frontend to Rails API**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-27T15:41:33Z
- **Completed:** 2026-03-27T15:44:43Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Installed @tanstack/react-query, @tanstack/react-query-devtools, and date-fns
- Created typed API fetch wrapper with CSRF token injection and error handling
- Built 6 custom hooks covering all API endpoints with proper query keys and cache invalidation
- Created 2 Zustand stores for UI-only state (filters, view toggles)
- All TypeScript compiles cleanly with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install npm packages, TypeScript types, and API fetch wrapper** - `acbdb12` (feat)
2. **Task 2: QueryClientProvider, custom hooks, and Zustand stores** - `7e87f7d` (feat)

## Files Created/Modified
- `source/dashboard/app/frontend/types/api.ts` - TypeScript interfaces for all API response shapes (Agent, Task, Approval, UsageRecord, DashboardData, Setting, PaginatedResponse)
- `source/dashboard/app/frontend/lib/api.ts` - Shared fetch wrapper with CSRF, credentials, ApiError class, and apiMutate helper
- `source/dashboard/app/frontend/components/App.tsx` - QueryClientProvider wrapping RouterProvider with 30s stale / 5min gc / 1 retry defaults and ReactQueryDevtools
- `source/dashboard/app/frontend/hooks/useAgents.ts` - useAgents (paginated list with filters) and useAgent (single) hooks
- `source/dashboard/app/frontend/hooks/useTasks.ts` - useTasks (paginated list with filters) and useTask (single) hooks
- `source/dashboard/app/frontend/hooks/useApprovals.ts` - useApprovals, useApproval, useApproveApproval, useDenyApproval hooks with cache invalidation
- `source/dashboard/app/frontend/hooks/useUsage.ts` - useUsage hook with date range and granularity params
- `source/dashboard/app/frontend/hooks/useDashboard.ts` - useDashboard hook with 15s staleTime for frequent KPI refresh
- `source/dashboard/app/frontend/hooks/useSettings.ts` - useSettings, useSetting, useUpdateSetting hooks
- `source/dashboard/app/frontend/stores/filterStore.ts` - Zustand store for agent/task/approval filters and usage time range (default 24h)
- `source/dashboard/app/frontend/stores/viewStore.ts` - Zustand store for agent view (grid/table) and task view (board/list)
- `source/dashboard/package.json` - Added @tanstack/react-query, @tanstack/react-query-devtools, date-fns

## Decisions Made
- **Used llm_model in TypeScript types:** Read actual jbuilder views to confirm agents and usage records use `llm_model` (not `model_name`). TypeScript interfaces and hook filter params use `llm_model` to match the real API response shape.
- **QueryParams type for apiFetch:** TypeScript strict mode rejects passing typed interfaces (e.g., `UseAgentsParams`) where `Record<string, unknown>` is expected due to missing index signatures. Used `Record<string, any>` type alias for the params argument -- query params are serialized to strings anyway, so strict value typing adds no safety.
- **Dashboard staleTime 15s:** The dashboard KPI endpoint aggregates across all resources and should refresh more frequently than individual resource lists (30s default).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used llm_model instead of model_name in TypeScript interfaces**
- **Found during:** Task 1 (TypeScript types creation)
- **Issue:** Plan text specified `model_name` in Agent and UsageRecord interfaces, but actual jbuilder views use `llm_model` (renamed in Plan 01 to avoid ActiveRecord reserved attribute)
- **Fix:** Used `llm_model` in Agent.llm_model, UsageRecord.llm_model, UseAgentsParams.llm_model, and filterStore AgentFilters.llm_model
- **Files modified:** types/api.ts, hooks/useAgents.ts, stores/filterStore.ts
- **Verification:** TypeScript compiles, field names match jbuilder view output
- **Committed in:** acbdb12 (Task 1), 7e87f7d (Task 2)

**2. [Rule 3 - Blocking] Fixed apiFetch params type for TypeScript strict mode**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** `npx tsc --noEmit` failed with 4 errors -- typed param interfaces (UseAgentsParams, etc.) not assignable to `Record<string, unknown>` due to missing index signatures in strict mode
- **Fix:** Changed apiFetch params type to `Record<string, any>` via QueryParams type alias
- **Files modified:** source/dashboard/app/frontend/lib/api.ts
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** 7e87f7d (Task 2)

**3. [Rule 2 - Missing Critical] Added id field to UsageRecord interface**
- **Found during:** Task 1 (reading jbuilder views)
- **Issue:** Plan's UsageRecord interface omitted the `id` field, but the usage jbuilder view includes `json.id record.id`
- **Fix:** Added `id: string` to UsageRecord interface
- **Files modified:** source/dashboard/app/frontend/types/api.ts
- **Verification:** Interface matches actual API response shape
- **Committed in:** acbdb12 (Task 1)

---

**Total deviations:** 3 auto-fixed (1 bug, 1 blocking, 1 missing field)
**Impact on plan:** All fixes ensure TypeScript types match actual API responses. No scope creep.

## Issues Encountered
- TypeScript 6 strict mode requires index signatures on types passed as `Record<string, T>` -- a common strictness issue when typed interfaces are used as generic record params. Resolved with explicit QueryParams type alias.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 6 custom hooks are ready for screen components to consume (Phases 05-10)
- Zustand filter/view stores provide UI state management for agent, task, approval, and usage screens
- TypeScript interfaces match actual API response shapes -- downstream components can import and use them directly
- apiFetch/apiMutate handle CSRF, credentials, and error handling -- no per-component boilerplate needed

## Self-Check: PASSED

All files verified present. Both commits verified in git history.

---
*Phase: 04-data-layer*
*Completed: 2026-03-27*
