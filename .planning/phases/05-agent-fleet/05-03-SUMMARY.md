---
phase: 05-agent-fleet
plan: 03
subsystem: ui
tags: [react, tanstack-query, font-awesome, sonner, tailwind, table, context-menu, sort]

# Dependency graph
requires:
  - phase: 05-agent-fleet/01
    provides: "Agent API hooks (useAgents), types (Agent), UI primitives (Badge, Button, Sparkline)"
  - phase: 05-agent-fleet/02
    provides: "AgentCard, AgentGrid, AgentFilters, AgentViewToggle, AgentsPage shell"
provides:
  - "AgentTable component with sortable columns and sort state management"
  - "AgentContextMenu component with Restart, View Logs, and Disable actions"
  - "useUpdateAgent mutation hook for PATCH /api/v1/agents/:id"
  - "Complete dual-view Agent Fleet page (grid + table toggle)"
affects: [agent-fleet, dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sort state lifted to parent (AgentsPage) and passed to both useAgents hook and AgentTable"
    - "Context menu managed internally by each component (AgentCard, AgentTable) using local useState"
    - "useMutation with queryClient.invalidateQueries for cache invalidation on agent updates"
    - "Column definition array with hiddenBelow property for responsive table columns"

key-files:
  created:
    - source/dashboard/app/frontend/components/agents/AgentTable.tsx
    - source/dashboard/app/frontend/components/agents/AgentContextMenu.tsx
  modified:
    - source/dashboard/app/frontend/hooks/useAgents.ts
    - source/dashboard/app/frontend/components/pages/AgentsPage.tsx
    - source/dashboard/app/frontend/components/agents/AgentCard.tsx
    - source/dashboard/app/frontend/components/agents/AgentGrid.tsx

key-decisions:
  - "Context menu owned by each view component (AgentCard, AgentTable) rather than centralized in AgentsPage"
  - "Custom table built for AgentTable (not wrapping generic Table component) to support sort headers and per-row state classes"
  - "Sort cycle: unsorted -> asc -> desc -> unsorted (3-state toggle)"

patterns-established:
  - "Column definition array with SortableColumn interface including hiddenBelow for responsive hiding"
  - "useMutation + invalidateQueries pattern for agent state mutations"
  - "Context menu with click-outside + Escape key dismissal via useEffect event listeners"

requirements-completed: [AGNT-02, AGNT-05, AGNT-06]

# Metrics
duration: 3min
completed: 2026-03-27
---

# Phase 05 Plan 03: Agent Table & Context Menu Summary

**Sortable agent table with 7 columns, context menu with restart/logs/disable actions, and dual grid-table view toggle in AgentsPage**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-27T18:37:55Z
- **Completed:** 2026-03-27T18:41:50Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- AgentTable renders 7 columns (Name, Status, Model, Current Task, Uptime, Tokens 7d, Actions) with 5 sortable columns using FA sort icons and aria-sort attributes
- AgentContextMenu provides Restart Agent (toast), View Logs (toast), and Disable Agent (PATCH mutation + cache invalidation + toast) actions
- AgentsPage now toggles between grid and table views with sort state passed to API hooks for server-side sorting
- Disabled agent rows render at opacity-50 in table view; context menu is accessible via ellipsis button in both views

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AgentTable with sortable columns and AgentContextMenu with toast actions** - `0f35ebe` (feat)
2. **Task 2: Wire AgentTable and AgentContextMenu into AgentsPage, update AgentCard and AgentGrid for context menu** - `f6bdfc5` (feat)

## Files Created/Modified
- `source/dashboard/app/frontend/components/agents/AgentTable.tsx` - Sortable table view with 7 columns, sort icons, aria-sort, disabled row opacity
- `source/dashboard/app/frontend/components/agents/AgentContextMenu.tsx` - Context menu with Restart, View Logs, Disable actions and toast feedback
- `source/dashboard/app/frontend/hooks/useAgents.ts` - Added useUpdateAgent mutation hook with cache invalidation
- `source/dashboard/app/frontend/components/pages/AgentsPage.tsx` - Integrated table view, sort state, table skeleton loading, removed placeholder
- `source/dashboard/app/frontend/components/agents/AgentCard.tsx` - Self-managed context menu state (removed onMenuOpen prop)
- `source/dashboard/app/frontend/components/agents/AgentGrid.tsx` - Simplified (removed onMenuOpen prop passthrough)

## Decisions Made
- Context menu ownership: each view component (AgentCard, AgentTable) manages its own context menu state internally rather than lifting menu state to AgentsPage. This is cleaner because each view has different positioning needs.
- Custom table for AgentTable rather than wrapping the generic Table component -- needed custom sort headers with icons and per-row conditional classes (opacity-50 for disabled).
- Sort cycle uses 3-state toggle (unsorted -> asc -> desc -> unsorted) rather than 2-state (asc <-> desc) for cleaner UX.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

- `AgentContextMenu.tsx:40` - `toast.info("Log viewer coming soon")` - Intentional per plan; View Logs is a v2 feature. The context menu action is wired and functional (shows toast). No future plan dependency needed -- this will be resolved when log viewer is implemented.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Agent Fleet page is complete with grid view, table view, filters, sort, and context menu actions
- Ready for Phase 06 (Task Board) or any subsequent screen phase
- useUpdateAgent mutation pattern established for reuse with other agent actions

## Self-Check: PASSED

- All created files verified on disk
- All commit hashes found in git log
- TypeScript compilation: zero errors

---
*Phase: 05-agent-fleet*
*Completed: 2026-03-27*
