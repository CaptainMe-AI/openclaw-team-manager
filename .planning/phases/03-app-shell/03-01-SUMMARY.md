---
phase: 03-app-shell
plan: 01
subsystem: ui
tags: [react-router, zustand, font-awesome, csrf, routing, spa]

# Dependency graph
requires:
  - phase: 02-design-system
    provides: UI components (Button, Card, Badge, Table, Input, StatusDot), cn() utility, Tailwind theme tokens
provides:
  - React Router v7 with createBrowserRouter and 6 routes
  - Zustand useUIStore for sidebar mobile toggle
  - CSRF token helper for Devise sign-out
  - PlaceholderSkeleton component with shimmer KPI cards and table shape
  - 6 placeholder page components with correct titles and subtitles
  - Rails catch-all route for SPA direct URL navigation
  - Font Awesome packages installed for icon usage
affects: [03-02-app-shell, 04-dashboard, 05-agents, 06-tasks, 07-approvals, 08-usage, 09-settings]

# Tech tracking
tech-stack:
  added: [react-router@7.13.2, zustand@5.0.12, "@fortawesome/react-fontawesome@3.3.0", "@fortawesome/fontawesome-svg-core@6.7.2", "@fortawesome/free-solid-svg-icons@6.7.2"]
  patterns: [createBrowserRouter with root layout, Zustand store for global UI state, CSRF meta tag reader, placeholder skeleton pattern]

key-files:
  created:
    - source/dashboard/app/frontend/router.tsx
    - source/dashboard/app/frontend/stores/uiStore.ts
    - source/dashboard/app/frontend/lib/csrf.ts
    - source/dashboard/app/frontend/components/ui/PlaceholderSkeleton.tsx
    - source/dashboard/app/frontend/components/pages/DashboardPage.tsx
    - source/dashboard/app/frontend/components/pages/AgentsPage.tsx
    - source/dashboard/app/frontend/components/pages/TasksPage.tsx
    - source/dashboard/app/frontend/components/pages/UsagePage.tsx
    - source/dashboard/app/frontend/components/pages/ApprovalsPage.tsx
    - source/dashboard/app/frontend/components/pages/SettingsPage.tsx
  modified:
    - source/dashboard/package.json
    - source/dashboard/app/frontend/components/App.tsx
    - source/dashboard/app/frontend/components/ui/index.ts
    - source/dashboard/config/routes.rb

key-decisions:
  - "RootLayout is a temporary wrapper div; Plan 02 replaces it with AppShell"
  - "UsagePage uses &amp; for ampersand in JSX (renders as & in browser)"

patterns-established:
  - "Page component pattern: named export, h1 title + p subtitle + PlaceholderSkeleton"
  - "Zustand store pattern: create<StateInterface> with actions in the same object"
  - "CSRF helper reads fresh from meta tag on each call (not cached)"

requirements-completed: [SHEL-05]

# Metrics
duration: 3min
completed: 2026-03-27
---

# Phase 03 Plan 01: Routing & Placeholder Pages Summary

**React Router v7 with 6 SPA routes, Zustand sidebar store, CSRF helper, and shimmer skeleton placeholder pages**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-27T00:28:07Z
- **Completed:** 2026-03-27T00:31:30Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- React Router v7 installed and configured with createBrowserRouter, 6 child routes under a temporary RootLayout
- App.tsx replaced design system demo with RouterProvider for SPA navigation
- Rails catch-all route enables direct URL navigation (no 404 on /agents, /tasks, etc.)
- Zustand useUIStore manages sidebarOpen/toggleSidebar/closeSidebar for mobile sidebar
- CSRF getCsrfToken helper reads token from meta tag for Devise sign-out
- PlaceholderSkeleton renders 4 KPI card skeletons + table skeleton with animate-pulse shimmer
- All 6 placeholder pages render correct title, subtitle, and PlaceholderSkeleton per UI-SPEC
- Font Awesome packages installed for icon usage in subsequent plans
- TypeScript compiles without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install npm packages, create routing infrastructure and utilities** - `d6e2bf5` (feat)
2. **Task 2: Create PlaceholderSkeleton and 6 placeholder page components** - `a49366c` (feat)

## Files Created/Modified
- `source/dashboard/app/frontend/router.tsx` - React Router with createBrowserRouter, 6 routes, temporary RootLayout
- `source/dashboard/app/frontend/stores/uiStore.ts` - Zustand store for sidebar mobile toggle state
- `source/dashboard/app/frontend/lib/csrf.ts` - CSRF token reader for Devise sign-out
- `source/dashboard/app/frontend/components/ui/PlaceholderSkeleton.tsx` - Shimmer skeleton with 4 KPI cards + table
- `source/dashboard/app/frontend/components/ui/index.ts` - Barrel export updated with PlaceholderSkeleton
- `source/dashboard/app/frontend/components/pages/DashboardPage.tsx` - Overview page placeholder (/ route)
- `source/dashboard/app/frontend/components/pages/AgentsPage.tsx` - Agent Fleet page placeholder (/agents)
- `source/dashboard/app/frontend/components/pages/TasksPage.tsx` - Task Board page placeholder (/tasks)
- `source/dashboard/app/frontend/components/pages/UsagePage.tsx` - Usage & Cost Tracking page placeholder (/usage)
- `source/dashboard/app/frontend/components/pages/ApprovalsPage.tsx` - Approvals page placeholder (/approvals)
- `source/dashboard/app/frontend/components/pages/SettingsPage.tsx` - Configuration Settings page placeholder (/settings)
- `source/dashboard/app/frontend/components/App.tsx` - Replaced design system demo with RouterProvider
- `source/dashboard/config/routes.rb` - Added catch-all route for SPA navigation
- `source/dashboard/package.json` - Added react-router, zustand, Font Awesome dependencies

## Decisions Made
- RootLayout is a temporary div wrapper; Plan 02 replaces it with the full AppShell component (sidebar + top bar)
- UsagePage uses `&amp;` for the ampersand in JSX, which renders as `&` in the browser

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - placeholder pages are intentionally skeleton placeholders by design. They will be replaced with real content in phases 04-09. The PlaceholderSkeleton component is a reusable UI component, not a stub.

## Next Phase Readiness
- Routing skeleton complete with 6 navigable routes
- Plan 02 builds the AppShell (sidebar + top bar) on top of this routing infrastructure
- useUIStore ready for sidebar mobile toggle in Plan 02
- getCsrfToken ready for sign-out action in UserMenu (Plan 02)
- All page components ready to receive real content in later phases

## Self-Check: PASSED

All 10 created files verified present. Both task commits (d6e2bf5, a49366c) verified in git history. TypeScript compiles without errors.

---
*Phase: 03-app-shell*
*Completed: 2026-03-27*
