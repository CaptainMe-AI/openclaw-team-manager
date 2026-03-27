---
phase: 05-agent-fleet
plan: 01
subsystem: api, ui
tags: [recharts, sonner, sparkline, jbuilder, agent-enrichment, token-aggregation]

# Dependency graph
requires:
  - phase: 04-data-layer
    provides: "Agent model, UsageRecord model, AgentService, REST API, TanStack Query hooks, TypeScript types"
provides:
  - "Enriched Agent API with current_task, tokens_7d, tokens_7d_series fields"
  - "AgentService.enrich_with_token_data for N+1-free token aggregation"
  - "Reusable Sparkline component (Recharts LineChart, no axes/tooltips)"
  - "Sonner Toaster configured with dark theme in App root"
  - "recharts and sonner npm packages installed"
  - "Updated TypeScript Agent interface with enriched fields"
affects: [05-agent-fleet, 06-task-board, 07-usage-cost]

# Tech tracking
tech-stack:
  added: [recharts, sonner]
  patterns: [singleton-method-enrichment, aggregate-query-pattern, sparkline-component]

key-files:
  created:
    - source/dashboard/app/frontend/components/ui/Sparkline.tsx
  modified:
    - source/dashboard/app/services/agent_service.rb
    - source/dashboard/app/views/api/v1/agents/_agent.json.jbuilder
    - source/dashboard/app/controllers/api/v1/agents_controller.rb
    - source/dashboard/spec/requests/api/v1/agents_spec.rb
    - source/dashboard/app/frontend/types/api.ts
    - source/dashboard/app/frontend/components/ui/index.ts
    - source/dashboard/app/frontend/components/App.tsx
    - source/dashboard/package.json

key-decisions:
  - "Used define_singleton_method for token data enrichment to avoid modifying Agent model"
  - "Sparkline width prop typed as number | template literal to match Recharts ResponsiveContainer API"

patterns-established:
  - "Singleton method enrichment: attach computed data to AR objects via define_singleton_method"
  - "Aggregate query pattern: two GROUP BY queries (totals + daily series) to avoid N+1"
  - "Sparkline minimal config: no axes, no tooltips, no animation, explicit pixel height"

requirements-completed: [AGNT-01, AGNT-02, AGNT-04]

# Metrics
duration: 4min
completed: 2026-03-27
---

# Phase 05 Plan 01: Agent API Enrichment Summary

**Enriched Agent API with current_task/tokens_7d/tokens_7d_series, installed recharts + sonner, created reusable Sparkline component**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-27T18:26:31Z
- **Completed:** 2026-03-27T18:30:46Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Agent API now returns current_task (string|null), tokens_7d (integer), and tokens_7d_series (7-element array) for each agent
- Token data computed server-side via 2 aggregate queries (no N+1) using AgentService.enrich_with_token_data
- Reusable Sparkline component created with Recharts LineChart (no axes, tooltips, or animation)
- Sonner Toaster integrated into App root with dark theme styling
- 5 new request specs added (enriched fields, null current_task, llm_model filter, name sort, show endpoint)

## Task Commits

Each task was committed atomically:

1. **Task 1: Backend API enrichment** - `9c0990c` (feat)
2. **Task 2: Frontend packages, types, Sparkline, Sonner** - `1949c91` (feat)

## Files Created/Modified
- `source/dashboard/app/services/agent_service.rb` - Added enrich_with_token_data class method, includes(:tasks) preloading
- `source/dashboard/app/views/api/v1/agents/_agent.json.jbuilder` - Added current_task, tokens_7d, tokens_7d_series fields
- `source/dashboard/app/controllers/api/v1/agents_controller.rb` - Calls enrichment after pagination in index/show
- `source/dashboard/spec/requests/api/v1/agents_spec.rb` - 5 new specs for enriched fields, filters, sorting
- `source/dashboard/app/frontend/types/api.ts` - Added current_task, tokens_7d, tokens_7d_series to Agent interface
- `source/dashboard/app/frontend/components/ui/Sparkline.tsx` - New reusable sparkline chart component
- `source/dashboard/app/frontend/components/ui/index.ts` - Added Sparkline barrel export
- `source/dashboard/app/frontend/components/App.tsx` - Added Sonner Toaster with dark theme
- `source/dashboard/package.json` - Added recharts and sonner dependencies

## Decisions Made
- Used `define_singleton_method` to attach computed token data to Agent objects rather than adding virtual attributes to the model -- keeps the enrichment concern in the service layer
- Typed Sparkline `width` prop as `number | \`${number}%\`` instead of `string` to match Recharts ResponsiveContainer TypeScript API

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Sparkline width TypeScript type**
- **Found during:** Task 2 (Sparkline component creation)
- **Issue:** Plan specified `width?: string` but Recharts ResponsiveContainer expects `number | \`${number}%\``
- **Fix:** Changed type to `number | \`${number}%\`` to match Recharts API
- **Files modified:** source/dashboard/app/frontend/components/ui/Sparkline.tsx
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** 1949c91 (Task 2 commit)

**2. [Rule 3 - Blocking] Added tasks preloading in show action**
- **Found during:** Task 1 (Controller show action)
- **Issue:** Jbuilder partial accesses `agent.tasks` but show action did not preload tasks, would cause N+1
- **Fix:** Used `Agent.includes(:tasks).find(params[:id])` in show action
- **Files modified:** source/dashboard/app/controllers/api/v1/agents_controller.rb
- **Verification:** Show endpoint spec passes with enriched fields
- **Committed in:** 9c0990c (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
- Pre-existing SettingsService.find_by failure in settings_spec.rb (2 failures) -- not caused by this plan's changes, logged to deferred-items.md

## Known Stubs
None -- all data fields are wired to real database queries.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Enriched Agent API ready for consumption by Plan 02 (Agent Fleet grid/table views)
- Sparkline component available for use in agent cards and fleet table
- Sonner Toaster ready for toast notifications in approval/action flows

## Self-Check: PASSED

All 9 files verified present. Both commit hashes (9c0990c, 1949c91) found in git log.

---
*Phase: 05-agent-fleet*
*Completed: 2026-03-27*
