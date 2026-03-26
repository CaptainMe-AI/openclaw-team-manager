---
phase: 02-design-system
plan: 01
subsystem: ui
tags: [tailwind, css, vite, typescript, design-tokens]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Rails app with Vite + Tailwind v4 + React + TypeScript
provides:
  - cn() utility for conditional Tailwind class merging
  - 21 color tokens (11 original + 10 new) in CSS @theme block
  - Vite path alias @/* resolving to app/frontend/*
  - card-glow CSS utility
  - Custom scrollbar styles
  - CSS module type declaration for TypeScript
affects: [02-design-system, 03-shell-layout, 04-dashboard, 05-agents, 06-tasks, 07-approvals, 08-usage-settings]

# Tech tracking
tech-stack:
  added: [clsx, tailwind-merge]
  patterns: [cn() utility pattern for conditional class composition, CSS-first Tailwind v4 @theme tokens]

key-files:
  created:
    - source/dashboard/app/frontend/lib/utils.ts
    - source/dashboard/app/frontend/types/css.d.ts
  modified:
    - source/dashboard/app/frontend/styles/application.css
    - source/dashboard/vite.config.mts
    - source/dashboard/package.json
    - source/dashboard/tsconfig.json

key-decisions:
  - "Used ignoreDeprecations flag for TypeScript 6.x baseUrl compatibility instead of removing baseUrl+paths"
  - "Added CSS module type declaration to support side-effect CSS imports in TypeScript 6"
  - "Kept Google Fonts URL unchanged -- already loads correct weights per UI-SPEC"

patterns-established:
  - "cn() utility: import { cn } from '@/lib/utils' for all conditional class composition"
  - "@/* path alias: use @/ prefix for all app/frontend imports in both TypeScript and Vite"
  - "CSS @theme tokens: all design tokens defined in application.css @theme block"

requirements-completed: [DSGN-01, DSGN-02]

# Metrics
duration: 2min
completed: 2026-03-26
---

# Phase 02 Plan 01: Design Foundation Summary

**Tailwind v4 design tokens (21 colors including priority/chart series), cn() utility with clsx+tailwind-merge, and Vite @/* path alias**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-26T17:50:54Z
- **Completed:** 2026-03-26T17:53:04Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Installed clsx and tailwind-merge, configured Vite resolve.alias for @/* imports
- Extended Tailwind @theme with 10 new color tokens (info, 4 priority levels, 5 chart colors)
- Created cn() utility for conditional class composition used by all future components
- Added card-glow CSS utility and custom scrollbar styles
- Fixed TypeScript 6.x compilation issues (baseUrl deprecation, CSS import types)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install npm dependencies and configure Vite path alias** - `57841d5` (feat)
2. **Task 2: Extend theme tokens, fix font weights, add CSS utilities** - `68a7418` (feat)
3. **Task 3: Create cn() utility and verify TypeScript compilation** - `0e3838b` (feat)

## Files Created/Modified
- `source/dashboard/app/frontend/lib/utils.ts` - cn() utility combining clsx + tailwind-merge
- `source/dashboard/app/frontend/types/css.d.ts` - Type declaration for CSS side-effect imports
- `source/dashboard/app/frontend/styles/application.css` - Extended with 10 new color tokens, card-glow utility, scrollbar styles
- `source/dashboard/vite.config.mts` - Added path.resolve alias for @/* imports
- `source/dashboard/package.json` - Added clsx and tailwind-merge dependencies
- `source/dashboard/tsconfig.json` - Added ignoreDeprecations for TypeScript 6.x compatibility

## Decisions Made
- Used `ignoreDeprecations: "6.0"` in tsconfig.json to handle TypeScript 6.x deprecation of baseUrl option, since baseUrl+paths are still needed for the @/* alias pattern
- Created CSS module type declaration (`types/css.d.ts`) to resolve TypeScript 6 strict checking of side-effect CSS imports
- Kept Google Fonts URL unchanged in application.html.erb since it already loads the exact weights specified by the UI-SPEC (Inter 400,600 and JetBrains Mono 400,700)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript 6.x baseUrl deprecation error**
- **Found during:** Task 3 (Create cn() utility and verify TypeScript compilation)
- **Issue:** TypeScript 6.x treats baseUrl as deprecated, causing compilation error (exit code 2)
- **Fix:** Added `"ignoreDeprecations": "6.0"` to tsconfig.json compilerOptions as recommended by TypeScript
- **Files modified:** source/dashboard/tsconfig.json
- **Verification:** `npx tsc --noEmit` exits cleanly
- **Committed in:** 0e3838b (Task 3 commit)

**2. [Rule 3 - Blocking] Missing CSS module type declaration for TypeScript 6**
- **Found during:** Task 3 (Create cn() utility and verify TypeScript compilation)
- **Issue:** TypeScript 6 strict mode requires type declarations for CSS side-effect imports; `import "../styles/application.css"` in application.tsx caused TS2882 error
- **Fix:** Created `app/frontend/types/css.d.ts` declaring the `*.css` module type
- **Files modified:** source/dashboard/app/frontend/types/css.d.ts (new file)
- **Verification:** `npx tsc --noEmit` exits cleanly
- **Committed in:** 0e3838b (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes required for TypeScript compilation to pass. No scope creep -- both are standard TypeScript configuration for the installed version.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All design tokens in place for component development (Plan 02: base components)
- cn() utility ready for conditional class composition in all components
- @/* path alias working at both TypeScript and Vite build levels
- No blockers for Plan 02

## Self-Check: PASSED

All 6 created/modified files verified on disk. All 3 task commits (57841d5, 68a7418, 0e3838b) verified in git log.

---
*Phase: 02-design-system*
*Completed: 2026-03-26*
