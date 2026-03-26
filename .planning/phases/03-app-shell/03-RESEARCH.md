# Phase 3: App Shell - Research

**Researched:** 2026-03-26
**Domain:** React SPA shell layout, client-side routing, navigation components, responsive sidebar
**Confidence:** HIGH

## Summary

Phase 3 builds the persistent navigation chrome that wraps all screens: a fixed sidebar with 6 nav links, a top bar with breadcrumbs and search input, a user avatar dropdown with sign-out, and React Router v7 client-side routing. All unbuilt screens get a reusable placeholder skeleton component. The sidebar collapses on mobile via a hamburger-triggered drawer.

The existing codebase provides a solid foundation. Phase 2 delivered a design system with Card, Badge, Button, Input, StatusDot components plus Tailwind v4 theme tokens in `application.css`. The React entry point (`entrypoints/application.tsx`) renders `<App />` into a `<div id="root">` served by Rails via `PagesController#app`. Devise sessions are configured with `DELETE /users/sign_out` and CSRF tokens are available in meta tags. The `@` path alias maps to `app/frontend/` in both tsconfig and Vite config.

**Primary recommendation:** Install `react-router` and `zustand` as the only new npm dependencies. Use React Router v7's `createBrowserRouter` with a root layout route containing `<Outlet />`. Manage sidebar open/closed state with Zustand. Use Font Awesome icons (already in CLAUDE.md stack but not yet installed -- install `@fortawesome/react-fontawesome`, `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`). Add a Rails catch-all route so direct navigation to `/agents`, `/tasks`, etc. hits the SPA rather than a 404.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Fixed width `w-64` on desktop, always expanded. Collapsible via hamburger on mobile (slide-in drawer).
- **D-02:** 6 navigation items per spec: Dashboard (`/`), Agents (`/agents`), Tasks (`/tasks`), Usage (`/usage`), Approvals (`/approvals`), Settings (`/settings`).
- **D-03:** Active state styling: `bg-surfaceHover`, `text-accent`, left border accent -- per TEAM_MANAGER_SPEC.
- **D-04:** Approvals nav item shows a live-count badge (hardcoded for now, wired to real data in Phase 7).
- **D-05:** Breadcrumb format: `Command Center > {Page Name}` -- page name derived from current route.
- **D-06:** Global search input with placeholder `"Search agents, tasks, or approvals (Press '/')"`. The `/` keyboard shortcut is wired up to focus the input. No actual search results -- just focus behavior.
- **D-07:** Notification bell is a static icon with hardcoded unread dot indicator. No click handler, no dropdown. Visual placeholder only.
- **D-08:** Avatar dropdown includes: display name + email at top, "Profile" link (navigates to `/settings`), "Settings" link (also `/settings`), and "Sign Out" (destroys Devise session).
- **D-09:** Dropdown is a click-triggered popover anchored to the avatar. Closes on outside click or Escape key.
- **D-10:** All unbuilt routes render the real page title + subtitle from spec, plus a generic skeleton component (shimmer blocks suggesting cards/tables layout).
- **D-11:** One reusable `PlaceholderSkeleton` component used across all placeholder screens. Discarded when real screens are built.
- **D-12:** React Router v7 with 6 routes: `/`, `/agents`, `/tasks`, `/usage`, `/approvals`, `/settings`.
- **D-13:** All routes render within the app shell layout (sidebar + top bar persistent). No full-page routes outside the shell.

### Claude's Discretion
- Mobile sidebar drawer animation (slide direction, overlay backdrop)
- Exact skeleton shimmer block arrangement
- Whether avatar shows initials or generic icon when no profile image exists
- Dropdown component implementation details (portal vs inline)

### Deferred Ideas (OUT OF SCOPE)
- Real search results / search-as-you-type -- depends on data layer (Phase 4+) and pg_search (ENHN-02)
- Notification dropdown with real items -- notification system is v2 (ENHN-01)
- Dedicated /profile route -- link to /settings for now, separate profile page can be added later
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHEL-01 | Persistent sidebar navigation with icons, labels, active state (teal left-border), collapsible on mobile | React Router v7 layout route pattern with `<Outlet />`, Font Awesome icons, Tailwind active state classes, Zustand for mobile sidebar state |
| SHEL-02 | Top navigation bar with breadcrumbs and global search input (placeholder, `'/'` to focus) | Breadcrumb derived from `useLocation()`, keyboard shortcut via `useEffect` + `keydown` listener, Input component already exists with `ref` support |
| SHEL-03 | Notification bell with unread dot indicator | Static Font Awesome `faBell` icon + absolute-positioned dot div. No behavior needed (D-07). |
| SHEL-04 | User avatar with account dropdown | Click-triggered dropdown with outside-click/Escape close. Sign Out hits `DELETE /users/sign_out` with CSRF token from meta tag. |
| SHEL-05 | React Router with routes for all 6 sections | `createBrowserRouter` with root layout route + 6 child routes. Rails catch-all route needed for direct URL navigation. |
</phase_requirements>

## Standard Stack

### Core (install for this phase)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router | ^7.13.2 | Client-side routing, layout routes, `<Outlet />` | v7 is current stable. All imports from `"react-router"` (not `"react-router-dom"`). Locked in CLAUDE.md. |
| zustand | ^5.0.12 | Sidebar open/closed state (mobile) | Lightweight hook-based state. Locked in CLAUDE.md for UI state. |
| @fortawesome/react-fontawesome | ^3.3.0 | FontAwesome icon rendering in React | Design spec uses FA icons. Locked in CLAUDE.md. |
| @fortawesome/fontawesome-svg-core | ^6.7.2 | SVG icon engine | Required peer dependency for react-fontawesome. Verified version on npm. |
| @fortawesome/free-solid-svg-icons | ^6.7.2 | Solid icon pack (robot, chart-line, list-check, chart-pie, shield-check, gear, bell, magnifying-glass, bars, xmark, chevron-right, user, right-from-bracket) | All spec icons are in the free solid set. |

### Already Installed (reuse)
| Library | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.4 | Component rendering |
| react-dom | ^19.2.4 | DOM rendering |
| clsx | ^2.1.1 | Conditional className composition |
| tailwind-merge | ^3.5.0 | Tailwind class conflict resolution |
| @tailwindcss/vite | ^4.2.2 | Tailwind v4 Vite plugin |

### Not Needed This Phase
| Library | Why Not |
|---------|---------|
| @tanstack/react-query | No API calls this phase. Server state management is Phase 4. |
| @dnd-kit/* | Kanban drag-and-drop is Phase 6. |
| recharts | Charts are Phase 8. |

**Installation:**
```bash
cd source/dashboard
npm install react-router@^7.13.2 zustand@^5.0.12 @fortawesome/react-fontawesome@^3.3.0 @fortawesome/fontawesome-svg-core@^6.7.2 @fortawesome/free-solid-svg-icons@^6.7.2
```

## Architecture Patterns

### Recommended Project Structure
```
app/frontend/
├── components/
│   ├── App.tsx                  # BrowserRouter setup with RouterProvider
│   ├── layout/
│   │   ├── AppShell.tsx         # Root layout: sidebar + top bar + <Outlet />
│   │   ├── Sidebar.tsx          # Sidebar navigation component
│   │   ├── TopBar.tsx           # Top navigation bar component
│   │   ├── Breadcrumb.tsx       # Breadcrumb display (route-derived)
│   │   ├── SearchInput.tsx      # Global search input with '/' shortcut
│   │   ├── UserMenu.tsx         # Avatar + dropdown (Profile, Settings, Sign Out)
│   │   └── NotificationBell.tsx # Bell icon with unread dot (static)
│   ├── pages/
│   │   ├── DashboardPage.tsx    # Placeholder for "/"
│   │   ├── AgentsPage.tsx       # Placeholder for "/agents"
│   │   ├── TasksPage.tsx        # Placeholder for "/tasks"
│   │   ├── UsagePage.tsx        # Placeholder for "/usage"
│   │   ├── ApprovalsPage.tsx    # Placeholder for "/approvals"
│   │   └── SettingsPage.tsx     # Placeholder for "/settings"
│   └── ui/
│       ├── index.ts             # Existing barrel export
│       ├── PlaceholderSkeleton.tsx  # Reusable shimmer skeleton
│       └── ... existing components
├── stores/
│   └── uiStore.ts               # Zustand store for sidebar state
├── lib/
│   ├── utils.ts                 # Existing cn() utility
│   └── csrf.ts                  # CSRF token helper for sign-out
├── router.tsx                   # Route definitions (createBrowserRouter)
├── entrypoints/
│   └── application.tsx          # Existing entry point
├── styles/
│   └── application.css          # Existing theme tokens
└── types/
    └── css.d.ts                 # Existing CSS module types
```

### Pattern 1: Root Layout Route with Outlet
**What:** React Router v7 layout route wraps all child routes. The `AppShell` component renders sidebar + top bar + `<Outlet />` where child routes appear.
**When to use:** Always -- this is the core pattern for persistent navigation chrome.
**Example:**
```typescript
// router.tsx
import { createBrowserRouter } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/components/pages/DashboardPage";
// ... other page imports

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "agents", element: <AgentsPage /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "usage", element: <UsagePage /> },
      { path: "approvals", element: <ApprovalsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

// App.tsx
import { RouterProvider } from "react-router";
import { router } from "@/router";

export default function App() {
  return <RouterProvider router={router} />;
}

// AppShell.tsx
import { Outlet } from "react-router";

export function AppShell() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```
Source: [React Router createBrowserRouter docs](https://reactrouter.com/api/data-routers/createBrowserRouter)

### Pattern 2: NavLink for Active State
**What:** React Router v7's `<NavLink>` component applies active class automatically when route matches.
**When to use:** Every sidebar navigation link.
**Example:**
```typescript
import { NavLink } from "react-router";

// NavLink passes { isActive } to className function
<NavLink
  to="/agents"
  className={({ isActive }) =>
    cn(
      "flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors",
      isActive
        ? "bg-surface-hover text-accent border-l-2 border-accent"
        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
    )
  }
>
  <FontAwesomeIcon icon={faRobot} className="w-4" />
  Agents
</NavLink>
```
Source: [React Router NavLink](https://reactrouter.com/api/components/NavLink)

### Pattern 3: Zustand Store for UI State
**What:** Small Zustand store for sidebar mobile open/close state.
**When to use:** Any client UI state that multiple components need (sidebar toggle, mobile drawer).
**Example:**
```typescript
// stores/uiStore.ts
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
```
Source: [Zustand GitHub](https://github.com/pmndrs/zustand)

### Pattern 4: Font Awesome Individual Icon Imports
**What:** Import specific icons by name for tree-shaking. Do NOT use `library.add()` pattern.
**When to use:** Every component that renders an icon.
**Example:**
```typescript
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faChartLine, faListCheck, faChartPie, faShieldCheck, faGear } from "@fortawesome/free-solid-svg-icons";

<FontAwesomeIcon icon={faRobot} className="w-4 h-4" />
```
Source: [Font Awesome tree-shaking docs](https://docs.fontawesome.com/apis/javascript/tree-shaking/)

### Pattern 5: CSRF Token for Devise Sign-Out
**What:** Read CSRF token from Rails meta tags to include in the DELETE request for session destruction.
**When to use:** The Sign Out action in the user dropdown.
**Example:**
```typescript
// lib/csrf.ts
export function getCsrfToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute("content") ?? "";
}

// UserMenu.tsx — sign-out handler
async function handleSignOut() {
  const token = getCsrfToken();
  await fetch("/users/sign_out", {
    method: "DELETE",
    headers: {
      "X-CSRF-Token": token,
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
  });
  // Devise will redirect to sign-in page; follow it
  window.location.href = "/users/sign_in";
}
```

### Pattern 6: Keyboard Shortcut for Search Focus
**What:** Listen for `/` keypress globally, focus the search input, prevent default only when not already in a text field.
**When to use:** The global search input in the top bar.
**Example:**
```typescript
// SearchInput.tsx
const inputRef = React.useRef<HTMLInputElement>(null);

React.useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(
      (e.target as HTMLElement).tagName
    )) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Pattern 7: Click-Outside and Escape to Close Dropdown
**What:** Custom hook or inline logic that closes a popover when clicking outside or pressing Escape.
**When to use:** User avatar dropdown.
**Example:**
```typescript
// useClickOutside hook
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") handler();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [ref, handler]);
}
```

### Anti-Patterns to Avoid
- **Importing entire FA icon packs:** `import { fas } from '@fortawesome/free-solid-svg-icons'` kills bundle size. Import individual icons only.
- **Using `react-router-dom` imports:** In v7, everything is imported from `"react-router"`. There is no separate `react-router-dom` package needed.
- **Storing route-derived state in Zustand:** Breadcrumb page names come from the current route via `useLocation()`. Do not duplicate route state in Zustand.
- **Building dropdown with portal when inline suffices:** The avatar dropdown is in the top-right corner with no overflow clipping issues. Use inline absolute positioning, not a React portal.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Active nav link detection | Manual pathname comparison with `useLocation()` | `<NavLink>` from react-router | NavLink provides `isActive` boolean automatically, handles index routes, and handles partial path matching correctly |
| Client-side routing | Custom history listener + conditional rendering | `createBrowserRouter` + `<RouterProvider>` | Handles URL matching, nested layouts, scroll restoration, error boundaries |
| Mobile sidebar toggle state | useState in AppShell passed via props | Zustand `useUIStore` | Hamburger button (TopBar) and sidebar (Sidebar) are sibling components -- Zustand avoids prop drilling through the layout |
| Icon rendering | Inline SVGs or custom icon component | `@fortawesome/react-fontawesome` `<FontAwesomeIcon>` | Consistent sizing, accessibility attributes, tree-shaking, matches design spec exactly |

## Common Pitfalls

### Pitfall 1: Rails 404 on Direct URL Navigation
**What goes wrong:** User navigates to `/agents` directly (browser address bar or refresh). Rails has no route for `/agents`, returns 404.
**Why it happens:** Only `root` is mapped in `routes.rb`. Client-side routes exist only in React Router.
**How to avoid:** Add a Rails catch-all route AFTER all other routes:
```ruby
# config/routes.rb — add at bottom, before final `end`
get "*path", to: "pages#app", constraints: ->(req) { !req.path.start_with?("/rails/") }
```
The constraint excludes Rails internal routes (Active Storage, Action Mailbox, etc.). Must be the LAST route.
**Warning signs:** 404 errors when refreshing on any non-root page.

### Pitfall 2: Devise Sign-Out Redirect Loop
**What goes wrong:** After sign-out, Devise redirects to the sign-in page, but the SPA catch-all route intercepts and renders the React app instead.
**Why it happens:** The catch-all route matches `/users/sign_in` before Devise's route. Or the sign-out fetch doesn't follow the redirect properly.
**How to avoid:** The Devise routes (`devise_for :users`) are declared BEFORE the catch-all route, so Devise routes take precedence. Use `window.location.href = "/users/sign_in"` after the fetch (full page navigation, not React Router navigation) to ensure the Devise login page renders via Rails, not the SPA.
**Warning signs:** Seeing the SPA shell when you should see the login page.

### Pitfall 3: "/" Key Fires in Input Fields
**What goes wrong:** User types "/" in the search input or any text field, and it refocuses the search input instead of typing the character.
**Why it happens:** The global keydown listener doesn't check whether focus is already in an input.
**How to avoid:** Check `e.target.tagName` before calling `e.preventDefault()`. Skip the shortcut if the event target is an INPUT, TEXTAREA, or SELECT element, or if `contentEditable` is true.
**Warning signs:** Cannot type "/" in any input field.

### Pitfall 4: Sidebar Active State on Index Route
**What goes wrong:** Dashboard nav link is always active, or never active when on child routes.
**Why it happens:** The root path "/" partially matches all routes, or the index route logic is misconfigured.
**How to avoid:** Use `<NavLink to="/" end>` for the Dashboard link. The `end` prop ensures it only matches the exact `/` path, not `/agents`, `/tasks`, etc.
**Warning signs:** Dashboard link highlighted when viewing other pages.

### Pitfall 5: Mobile Sidebar Not Closing After Navigation
**What goes wrong:** User taps a nav link on mobile, navigates to new page, but the sidebar drawer stays open.
**Why it happens:** Navigation happens via React Router but nothing triggers the sidebar close.
**How to avoid:** Call `closeSidebar()` from Zustand in the nav link click handler, or use a `useEffect` that watches `location.pathname` and closes the sidebar on change.
**Warning signs:** Sidebar overlays content after tapping a link on mobile.

### Pitfall 6: CSRF Token Stale After Long Session
**What goes wrong:** Sign-out fails with 422 Unprocessable Entity.
**Why it happens:** Rails rotates CSRF tokens. If the page has been open for a long time without a full reload, the meta tag token may be stale.
**How to avoid:** Read the token fresh from the meta tag at the moment of the fetch call (not cached at module load time). This is sufficient for a local dashboard with infrequent sign-outs.
**Warning signs:** 422 error on sign-out after leaving the tab open for hours.

## Code Examples

### Rails Catch-All Route (Verified pattern)
```ruby
# config/routes.rb
Rails.application.routes.draw do
  devise_for :users, skip: [:registrations]

  get "up" => "rails/health#show", as: :rails_health_check

  # SPA root
  root "pages#app"

  # Catch-all for client-side routing (MUST be last)
  get "*path", to: "pages#app", constraints: ->(req) {
    !req.path.start_with?("/rails/")
  }
end
```

### Breadcrumb from Route (Verified pattern)
```typescript
import { useLocation } from "react-router";

const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/agents": "Agents",
  "/tasks": "Tasks",
  "/usage": "Usage",
  "/approvals": "Approvals",
  "/settings": "Settings",
};

export function Breadcrumb() {
  const { pathname } = useLocation();
  const pageName = routeNames[pathname] ?? "Unknown";

  return (
    <nav className="flex items-center gap-2 text-sm">
      <span className="text-text-secondary">Command Center</span>
      <span className="text-text-secondary">&gt;</span>
      <span className="text-text-primary font-semibold">{pageName}</span>
    </nav>
  );
}
```

### Placeholder Page with Skeleton (Verified pattern)
```typescript
// pages/AgentsPage.tsx
import { PlaceholderSkeleton } from "@/components/ui/PlaceholderSkeleton";

export function AgentsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-primary">Agent Fleet</h1>
      <p className="text-sm text-text-secondary mt-1">
        Manage, monitor, and configure all registered OpenClaw agents.
      </p>
      <PlaceholderSkeleton className="mt-6" />
    </div>
  );
}
```

### Shimmer Skeleton Component
```typescript
// components/ui/PlaceholderSkeleton.tsx
import { cn } from "@/lib/utils";

interface PlaceholderSkeletonProps {
  className?: string;
}

export function PlaceholderSkeleton({ className }: PlaceholderSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* KPI card row skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-lg border border-border p-6 animate-pulse">
            <div className="h-3 w-20 bg-border rounded mb-3" />
            <div className="h-6 w-16 bg-border rounded" />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-surface rounded-lg border border-border p-6 animate-pulse">
        <div className="h-3 w-32 bg-border rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-border rounded" style={{ width: `${80 - i * 8}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Page Titles and Subtitles from Design Spec
```typescript
// Reference data for placeholder pages (from TEAM_MANAGER_SPEC.md)
const pageConfig = {
  "/":          { title: "Overview",                  subtitle: "Real-time status of your OpenClaw agent fleet." },
  "/agents":    { title: "Agent Fleet",               subtitle: "Manage, monitor, and configure all registered OpenClaw agents." },
  "/tasks":     { title: "Task Board",                subtitle: "Monitor and manage agent workflows across all stages." },
  "/usage":     { title: "Usage & Cost Tracking",     subtitle: "Monitor API consumption, latency, and estimated costs across your agent fleet." },
  "/approvals": { title: "Approvals",                 subtitle: "Manage pending requests and review historical decisions." },
  "/settings":  { title: "Configuration Settings",    subtitle: "Manage global preferences, agent policies, and data integrations." },
};
```

### Sidebar Navigation Items (from TEAM_MANAGER_SPEC.md Global Shell)
```typescript
import {
  faChartLine, faRobot, faListCheck,
  faChartPie, faShieldCheck, faGear
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface NavItem {
  label: string;
  path: string;
  icon: IconDefinition;
  badge?: number; // Only Approvals has a badge
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/",          icon: faChartLine },
  { label: "Agents",    path: "/agents",    icon: faRobot },
  { label: "Tasks",     path: "/tasks",     icon: faListCheck },
  { label: "Usage",     path: "/usage",     icon: faChartPie },
  { label: "Approvals", path: "/approvals", icon: faShieldCheck, badge: 3 }, // hardcoded per D-04
  { label: "Settings",  path: "/settings",  icon: faGear },
];
```

### Font Awesome Icons Needed (Full List)
```typescript
// Sidebar nav
import { faChartLine, faRobot, faListCheck, faChartPie, faShieldCheck, faGear } from "@fortawesome/free-solid-svg-icons";

// Top bar
import { faBell, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

// Mobile sidebar
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

// User menu dropdown
import { faUser, faRightFromBracket, faChevronRight } from "@fortawesome/free-solid-svg-icons";
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import from "react-router-dom"` | `import from "react-router"` | React Router v7 (Oct 2024) | Single package, no `react-router-dom` needed at all |
| `<BrowserRouter>` + `<Routes>` | `createBrowserRouter` + `<RouterProvider>` | React Router v6.4+ (2022), standard in v7 | Data-mode router supports loaders/actions; layout routes with `<Outlet>` are the standard nesting pattern |
| Tailwind config.js | CSS-first `@theme` block | Tailwind v4 (Jan 2025) | Theme tokens in `application.css` already use this approach |
| Redux for all state | Zustand for UI, React Query for server | 2024-2025 industry trend | Dramatically less boilerplate for dashboard-weight state |

**Deprecated/outdated:**
- `react-router-dom`: In v7, import everything from `"react-router"`. The `react-router-dom` package still exists but is unnecessary.
- `<BrowserRouter>` direct usage: While still supported, `createBrowserRouter` is the recommended approach in v7 for data-aware routing.

## Existing Codebase Integration Points

### Files That Change
| File | Change | Reason |
|------|--------|--------|
| `app/frontend/components/App.tsx` | Replace design system demo with `<RouterProvider>` | App becomes the router host instead of the component showcase |
| `source/dashboard/config/routes.rb` | Add catch-all route | Client-side routes need Rails to serve the SPA for any path |

### Files To Create
| File | Purpose |
|------|---------|
| `app/frontend/router.tsx` | Route definitions with `createBrowserRouter` |
| `app/frontend/components/layout/AppShell.tsx` | Root layout with sidebar + top bar + Outlet |
| `app/frontend/components/layout/Sidebar.tsx` | Navigation sidebar |
| `app/frontend/components/layout/TopBar.tsx` | Top navigation bar |
| `app/frontend/components/layout/Breadcrumb.tsx` | Route-derived breadcrumb |
| `app/frontend/components/layout/SearchInput.tsx` | Search input with '/' shortcut |
| `app/frontend/components/layout/UserMenu.tsx` | Avatar + dropdown |
| `app/frontend/components/layout/NotificationBell.tsx` | Bell icon with unread dot |
| `app/frontend/components/ui/PlaceholderSkeleton.tsx` | Reusable shimmer skeleton |
| `app/frontend/components/pages/*.tsx` | 6 placeholder page components |
| `app/frontend/stores/uiStore.ts` | Zustand store for sidebar state |
| `app/frontend/lib/csrf.ts` | CSRF token helper |

### Existing Components to Reuse
| Component | Where Used |
|-----------|------------|
| `Badge` (from `@/components/ui`) | Approval count badge in sidebar nav |
| `Input` (from `@/components/ui`) | Base styling for search input (or compose search input from scratch using same theme tokens) |
| `Card` (from `@/components/ui`) | Wrapping placeholder skeleton blocks |
| `cn()` (from `@/lib/utils`) | All conditional className composition |

## Project Constraints (from CLAUDE.md)

- **App location:** All frontend code in `source/dashboard/app/frontend/`
- **Tech stack:** React 19, Vite, Tailwind CSS v4 (CSS-first config)
- **Routing:** React Router v7.13.2 -- import from `"react-router"` not `"react-router-dom"`
- **State:** Zustand for UI state, TanStack Query for server state (server state not needed this phase)
- **Icons:** Font Awesome 6 free solid set with tree-shaking (import individual icons)
- **Styling:** Tailwind CSS with `cn()` utility (clsx + tailwind-merge)
- **Auth:** Devise -- session-based, sign-out via `DELETE /users/sign_out`
- **Serialization:** jbuilder (not relevant this phase but don't introduce alternatives)
- **Type safety:** TypeScript for all React code
- **Testing:** RSpec, Playwright with cypress-on-rails

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | RSpec ~8.0.4 + Playwright ^1.58.2 |
| Config file | `spec/rails_helper.rb` (RSpec), `e2e/playwright.config.js` (Playwright) |
| Quick run command | `cd source/dashboard && npx playwright test --project chromium --grep "PATTERN"` |
| Full suite command | `cd source/dashboard && bundle exec rspec && npx playwright test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SHEL-01 | Sidebar renders 6 nav links with icons; active link has teal left-border; sidebar collapses on mobile | E2E (Playwright) | `cd source/dashboard && npx playwright test e2e/playwright/e2e/app_shell.spec.ts -x` | Wave 0 |
| SHEL-02 | Top bar shows breadcrumbs ("Command Center > Page Name"); search input focuses on "/" keypress | E2E (Playwright) | `cd source/dashboard && npx playwright test e2e/playwright/e2e/app_shell.spec.ts -x` | Wave 0 |
| SHEL-03 | Notification bell renders with unread dot | E2E (Playwright) | `cd source/dashboard && npx playwright test e2e/playwright/e2e/app_shell.spec.ts -x` | Wave 0 |
| SHEL-04 | Avatar click opens dropdown; dropdown has Profile, Settings, Sign Out; outside click closes it | E2E (Playwright) | `cd source/dashboard && npx playwright test e2e/playwright/e2e/app_shell.spec.ts -x` | Wave 0 |
| SHEL-05 | Clicking sidebar links navigates without full page reload; all 6 routes render placeholder content | E2E (Playwright) | `cd source/dashboard && npx playwright test e2e/playwright/e2e/app_shell.spec.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd source/dashboard && npx playwright test e2e/playwright/e2e/app_shell.spec.ts --project chromium`
- **Per wave merge:** `cd source/dashboard && npx playwright test --project chromium`
- **Phase gate:** Full Playwright suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `e2e/playwright/e2e/app_shell.spec.ts` -- covers SHEL-01 through SHEL-05
- [ ] `e2e/playwright/support/auth_helper.ts` (or equivalent) -- authenticated session setup for Playwright tests (Devise login before testing app shell)

## Open Questions

1. **Devise authentication for Playwright tests**
   - What we know: cypress-on-rails is installed and configured. Playwright config exists at `e2e/playwright.config.js` pointing to `localhost:5017`. There is an `e2e/app_commands/` directory and `e2e/e2e_helper.rb` that suggest Rails state control integration.
   - What's unclear: Whether there's an existing Playwright auth setup (storageState, login fixture) or if we need to create one for E2E tests to access the authenticated app shell.
   - Recommendation: Create a Playwright `auth.setup.ts` project that logs in via Devise and saves `storageState` for other tests to reuse. This is a standard Playwright pattern.

2. **OpenClaw branding in sidebar header**
   - What we know: The design shows "OpenClaw" logo text + robot icon in the top-left of the sidebar. The exact logo SVG is not in the codebase.
   - What's unclear: Whether a custom SVG logo exists or if we use Font Awesome + text.
   - Recommendation: Use the Font Awesome robot icon (`faRobot`) + "OpenClaw" text styled per the design screenshots. This matches the visual treatment seen in the screenshots (orange robot icon + "OpenClaw" text).

## Sources

### Primary (HIGH confidence)
- [React Router v7 createBrowserRouter docs](https://reactrouter.com/api/data-routers/createBrowserRouter) - Router setup, layout routes, Outlet
- [React Router v7 upgrade guide](https://reactrouter.com/upgrading/v6) - Confirmed imports from `"react-router"` not `"react-router-dom"`
- [Font Awesome tree-shaking docs](https://docs.fontawesome.com/apis/javascript/tree-shaking/) - Individual icon imports
- [Font Awesome React add-icons docs](https://docs.fontawesome.com/web/use-with/react/add-icons) - React integration
- [Zustand GitHub](https://github.com/pmndrs/zustand) - Store creation pattern, TypeScript usage
- npm registry (verified 2026-03-26): react-router 7.13.2, zustand 5.0.12, @fortawesome/react-fontawesome 3.3.0, @fortawesome/fontawesome-svg-core 7.2.0 (latest; 6.7.x series also valid), @fortawesome/free-solid-svg-icons 7.2.0

### Secondary (MEDIUM confidence)
- [LogRocket: React Router v7 guide](https://blog.logrocket.com/react-router-v7-guide/) - Layout route patterns, NavLink usage
- [Robin Wieruch: React Router 7 tutorial](https://www.robinwieruch.de/react-router/) - createBrowserRouter patterns
- [DEV.to: React Router v7 guide](https://dev.to/utkvishwas/react-router-v7-a-comprehensive-guide-migration-from-v6-7d1) - Migration patterns from v6

### Tertiary (LOW confidence)
- Rails SPA catch-all route pattern -- well-established community pattern but found in older articles; verified against Rails routing docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries locked in CLAUDE.md with verified versions
- Architecture: HIGH - React Router layout route + Outlet is the documented standard pattern; codebase structure follows established Phase 2 conventions
- Pitfalls: HIGH - All pitfalls are well-documented in community resources and verified against the existing codebase (routes.rb, Devise config, CSRF setup)

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable libraries, no fast-moving dependencies)
