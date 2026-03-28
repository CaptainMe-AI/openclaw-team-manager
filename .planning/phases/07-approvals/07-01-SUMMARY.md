---
phase: 07-approvals
plan: 01
subsystem: api, ui
tags: [rails, react, jbuilder, tanstack-query, font-awesome, date-fns, sonner, zustand]

# Dependency graph
requires:
  - phase: 04-data-layer
    provides: Approval model, ApprovalService, ApprovalsController, useApprovals hooks, filterStore, API layer
  - phase: 02-design-system
    provides: Badge, Button, Card UI components with dark theme tokens
provides:
  - Batch approve POST endpoint (POST /api/v1/approvals/batch_approve)
  - resolved_by_name field in approval JSON responses
  - useBatchApprove React Query mutation hook
  - ApprovalCard expandable component with inline approve/deny actions
  - ApprovalDetailPanel with type-specific context rendering
  - ApprovalFilters with risk level filter and sort toggle
affects: [07-02-approvals-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Expandable card pattern: parent manages expanded state, card receives isExpanded + onToggleExpand props"
    - "stopPropagation on inline action buttons to prevent card expand/collapse on approve/deny"
    - "Type-specific context rendering via switch on approval_type with exhaustive check"
    - "Risk level color mapping via Record type for Badge color prop"

key-files:
  created:
    - source/dashboard/app/frontend/components/approvals/ApprovalCard.tsx
    - source/dashboard/app/frontend/components/approvals/ApprovalDetailPanel.tsx
    - source/dashboard/app/frontend/components/approvals/ApprovalFilters.tsx
  modified:
    - source/dashboard/app/services/approval_service.rb
    - source/dashboard/app/controllers/api/v1/approvals_controller.rb
    - source/dashboard/config/routes.rb
    - source/dashboard/app/views/api/v1/approvals/_approval.json.jbuilder
    - source/dashboard/app/frontend/hooks/useApprovals.ts
    - source/dashboard/app/frontend/types/api.ts
    - source/dashboard/spec/requests/api/v1/approvals_spec.rb
    - source/dashboard/spec/services/approval_service_spec.rb

key-decisions:
  - "batch_approve returns simple JSON { approved: N } instead of jbuilder view since client only needs count for toast message"
  - "resolved_by_name uses User email (no separate display_name field exists)"
  - "ApprovalCard expand state managed by parent (not internal) for single-expand behavior in Plan 02"

patterns-established:
  - "Approval type labels map: dangerous_command -> Production Deployment, sensitive_data -> Tool Access Request, budget_override -> Budget Override"
  - "Risk color mapping: critical -> danger, high -> warning, medium -> info, low -> idle"
  - "ApprovalFilters follows AgentFilters pattern: Button variant primary/secondary, aria-pressed, filterStore integration"

requirements-completed: [APPR-01, APPR-02, APPR-03, APPR-04, APPR-06, APPR-07]

# Metrics
duration: 4min
completed: 2026-03-28
---

# Phase 07 Plan 01: Approval Components Summary

**Batch approve endpoint, resolved_by_name in JSON, useBatchApprove hook, and three core approval UI components (ApprovalCard, ApprovalDetailPanel, ApprovalFilters)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-28T02:43:14Z
- **Completed:** 2026-03-28T02:47:47Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Added POST /api/v1/approvals/batch_approve endpoint with service, controller, route, and specs (25 total specs pass)
- Updated jbuilder partial to include resolved_by_name for approval history display
- Added useBatchApprove React Query mutation hook with approval + dashboard cache invalidation
- Built ApprovalCard with expandable detail panel, risk badge, type label, time waiting, agent name, and inline approve/deny buttons with spinner states and stopPropagation
- Built ApprovalDetailPanel with type-specific context rendering for dangerous_command, sensitive_data, and budget_override
- Built ApprovalFilters with risk level button group and sort direction toggle following AgentFilters pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Add batch approve backend endpoint, update jbuilder partial, add useBatchApprove hook, and add specs** - `43c0f5f` (feat)
2. **Task 2: Build ApprovalCard, ApprovalDetailPanel, and ApprovalFilters components** - `d71c8e7` (feat)

## Files Created/Modified
- `source/dashboard/app/services/approval_service.rb` - Added batch_approve class method
- `source/dashboard/app/controllers/api/v1/approvals_controller.rb` - Added batch_approve action
- `source/dashboard/config/routes.rb` - Added batch_approve collection route
- `source/dashboard/app/views/api/v1/approvals/_approval.json.jbuilder` - Added resolved_by_name field
- `source/dashboard/app/frontend/hooks/useApprovals.ts` - Added useBatchApprove mutation hook
- `source/dashboard/app/frontend/types/api.ts` - Added resolved_by_name to Approval interface
- `source/dashboard/spec/requests/api/v1/approvals_spec.rb` - Added batch_approve and resolved_by_name specs
- `source/dashboard/spec/services/approval_service_spec.rb` - Added batch_approve service specs
- `source/dashboard/app/frontend/components/approvals/ApprovalCard.tsx` - Expandable approval card with inline actions
- `source/dashboard/app/frontend/components/approvals/ApprovalDetailPanel.tsx` - Agent reasoning and type-specific context details
- `source/dashboard/app/frontend/components/approvals/ApprovalFilters.tsx` - Risk level filter and sort toggle

## Decisions Made
- batch_approve returns simple JSON `{ approved: N }` instead of jbuilder view since the client only needs the count for a toast message
- resolved_by_name uses User email since no separate display_name field exists on the User model
- ApprovalCard expand state managed by parent (isExpanded + onToggleExpand props) to allow single-expand behavior when composed into the page in Plan 02

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all components are fully wired to hooks and API layer.

## Next Phase Readiness
- All building blocks ready for Plan 02 to compose the full ApprovalsPage
- ApprovalCard, ApprovalDetailPanel, ApprovalFilters export cleanly for page assembly
- useBatchApprove hook ready for batch approve all button in page header
- Backend batch_approve endpoint tested and functional

## Self-Check: PASSED

All 11 files verified present. Both task commits (43c0f5f, d71c8e7) confirmed in git log.

---
*Phase: 07-approvals*
*Completed: 2026-03-28*
