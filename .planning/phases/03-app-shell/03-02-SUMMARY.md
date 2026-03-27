---
phase: 03-app-shell
plan: 02
subsystem: ui
tags: [react, react-router, zustand, fontawesome, tailwind, navigation, sidebar, topbar, layout]

# Dependency graph
requires:
  - phase: 03-app-shell plan 01
    provides: React Router setup, Zustand uiStore, placeholder pages, CSRF helper, cn() utility
  - phase: 02-design-system
    provides: Badge component, design tokens in application.css, Tailwind v4 theme
provides:
  - Sidebar navigation with 6 NavLink items, icons, active states, mobile drawer
  - TopBar with breadcrumb, search input, notification bell, user menu
  - AppShell root layout composing sidebar + top bar + content outlet
  - UserMenu with sign-out via Devise DELETE with CSRF
  - Router wired to AppShell as root layout element
affects: [04-mock-data, 05-agents, 06-tasks, 07-approvals, 08-usage, 09-settings]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "NavLink with isActive className callback for active state styling"
    - "Zustand store for cross-component sidebar toggle (TopBar hamburger -> Sidebar drawer)"
    - "useLocation pathname watch + useEffect for auto-closing mobile sidebar on route change"
    - "Inline dropdown (not portal) with click-outside and Escape-to-close via mousedown/keydown listeners"
    - "CSRF sign-out: getCsrfToken() read fresh per call, DELETE fetch, window.location.href redirect (not navigate)"

key-files:
  created:
    - source/dashboard/app/frontend/components/layout/Sidebar.tsx
    - source/dashboard/app/frontend/components/layout/TopBar.tsx
    - source/dashboard/app/frontend/components/layout/Breadcrumb.tsx
    - source/dashboard/app/frontend/components/layout/SearchInput.tsx
    - source/dashboard/app/frontend/components/layout/NotificationBell.tsx
    - source/dashboard/app/frontend/components/layout/UserMenu.tsx
    - source/dashboard/app/frontend/components/layout/AppShell.tsx
  modified:
    - source/dashboard/app/frontend/router.tsx

key-decisions:
  - "Used faShieldHalved instead of faShieldCheck (does not exist in FA free solid)"
  - "UserMenu hardcodes Admin User / admin@openclaw.local -- real Devise user data deferred to future phase"
  - "Sign Out uses window.location.href (full page reload) instead of React Router navigate to ensure Rails Devise login page loads"

patterns-established:
  - "Layout components live in components/layout/ directory"
  - "AppShell as root layout route element wrapping all pages via Outlet"
  - "Sidebar uses CSS transform animation for mobile drawer (translate-x), always rendered for smooth transitions"
  - "TopBar is h-16 with border-b, flex justify-between layout"

requirements-completed: [SHEL-01, SHEL-02, SHEL-03, SHEL-04]

# Metrics
duration: 2min
completed: 2026-03-27
---

# Phase 03 Plan 02: App Shell Navigation Chrome Summary

**Sidebar with 6 NavLink items and teal active states, TopBar with breadcrumb/search/bell/user-menu, AppShell root layout with mobile-responsive drawer**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-27T00:35:21Z
- **Completed:** 2026-03-27T00:37:57Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Sidebar with 6 navigation links, Font Awesome icons, teal active state with left-border, and hardcoded approval badge (count 3)
- Mobile sidebar drawer with backdrop overlay, close button, and auto-close on route change
- TopBar with breadcrumb (Command Center > Page Name), search input with / keyboard shortcut, notification bell with unread dot, and user menu
- UserMenu dropdown with Profile, Settings, and Sign Out (CSRF-protected Devise session destroy)
- AppShell root layout composing sidebar + top bar + content outlet, wired as router root element

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Sidebar, Breadcrumb, SearchInput, and NotificationBell components** - `cd05f3d` (feat)
2. **Task 2: Create UserMenu, TopBar, and AppShell components; wire AppShell into router** - `529e881` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `source/dashboard/app/frontend/components/layout/Sidebar.tsx` - Sidebar navigation with 6 NavLink items, icons, active states, mobile drawer
- `source/dashboard/app/frontend/components/layout/Breadcrumb.tsx` - Route-derived breadcrumb: Command Center > Page Name
- `source/dashboard/app/frontend/components/layout/SearchInput.tsx` - Search input with / keyboard shortcut, hidden on mobile
- `source/dashboard/app/frontend/components/layout/NotificationBell.tsx` - Bell icon with static unread dot indicator
- `source/dashboard/app/frontend/components/layout/UserMenu.tsx` - Avatar button + dropdown with Profile, Settings, Sign Out
- `source/dashboard/app/frontend/components/layout/TopBar.tsx` - Top navigation bar assembling breadcrumb, search, bell, user menu
- `source/dashboard/app/frontend/components/layout/AppShell.tsx` - Root layout: sidebar + top bar + content outlet
- `source/dashboard/app/frontend/router.tsx` - Updated to use AppShell as root layout (removed temporary RootLayout)

## Decisions Made
- **faShieldHalved over faShieldCheck:** Plan specified faShieldCheck for Approvals nav icon, but this icon does not exist in @fortawesome/free-solid-svg-icons. Used faShieldHalved (shield icon) as the closest match.
- **Hardcoded user info in UserMenu:** Display name "Admin User" and email "admin@openclaw.local" are hardcoded. Real Devise user data will be wired in a future phase when the API layer is available.
- **window.location.href for sign-out redirect:** Uses full page navigation (not React Router navigate) to ensure the browser loads the Devise login page via Rails, not the SPA.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] faShieldCheck icon does not exist in FA free solid**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** Plan specified `faShieldCheck` icon import, but this icon name does not exist in `@fortawesome/free-solid-svg-icons`. TypeScript error TS2724.
- **Fix:** Replaced `faShieldCheck` with `faShieldHalved` which is the standard shield icon in Font Awesome 6 free solid set.
- **Files modified:** source/dashboard/app/frontend/components/layout/Sidebar.tsx
- **Verification:** `npx tsc --noEmit` compiles clean
- **Committed in:** 529e881 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor icon name correction. No scope creep.

## Issues Encountered
- npm packages (react-router, zustand, @fortawesome/*) were listed in package.json but not installed in node_modules (likely a worktree issue). Resolved by running `npm install`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- App shell is complete: all 6 routes render within sidebar + top bar layout
- Placeholder pages from Plan 01 display inside the AppShell content area
- Ready for Phase 04 (mock data layer) and subsequent screen implementations
- All future screens render inside the AppShell via the Outlet

## Self-Check: PASSED

All 8 files verified as present. Both commit hashes (cd05f3d, 529e881) found in git log. TypeScript compiles clean.

---
*Phase: 03-app-shell*
*Completed: 2026-03-27*
