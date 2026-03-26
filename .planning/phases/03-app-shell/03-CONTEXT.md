# Phase 3: App Shell - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Persistent navigation chrome that wraps all screens: sidebar navigation, top navigation bar, client-side routing, and placeholder screens for unbuilt sections. This is the structural skeleton — no data layer, no real-time, no API integration.

</domain>

<decisions>
## Implementation Decisions

### Sidebar Navigation
- **D-01:** Fixed width `w-64` on desktop, always expanded. Collapsible via hamburger on mobile (slide-in drawer).
- **D-02:** 6 navigation items per spec: Dashboard (`/`), Agents (`/agents`), Tasks (`/tasks`), Usage (`/usage`), Approvals (`/approvals`), Settings (`/settings`).
- **D-03:** Active state styling: `bg-surfaceHover`, `text-accent`, left border accent — per TEAM_MANAGER_SPEC.
- **D-04:** Approvals nav item shows a live-count badge (hardcoded for now, wired to real data in Phase 7).

### Top Navigation Bar
- **D-05:** Breadcrumb format: `Command Center > {Page Name}` — page name derived from current route.
- **D-06:** Global search input with placeholder `"Search agents, tasks, or approvals (Press '/')"`. The `/` keyboard shortcut is wired up to focus the input. No actual search results — just focus behavior.
- **D-07:** Notification bell is a static icon with hardcoded unread dot indicator. No click handler, no dropdown. Visual placeholder only.

### User Account Dropdown
- **D-08:** Avatar dropdown includes: display name + email at top, "Profile" link (navigates to `/settings`), "Settings" link (also `/settings`), and "Sign Out" (destroys Devise session).
- **D-09:** Dropdown is a click-triggered popover anchored to the avatar. Closes on outside click or Escape key.

### Placeholder Screens
- **D-10:** All unbuilt routes render the real page title + subtitle from spec, plus a generic skeleton component (shimmer blocks suggesting cards/tables layout).
- **D-11:** One reusable `PlaceholderSkeleton` component used across all placeholder screens. Discarded when real screens are built.

### Routing
- **D-12:** React Router v7 with 6 routes: `/`, `/agents`, `/tasks`, `/usage`, `/approvals`, `/settings`.
- **D-13:** All routes render within the app shell layout (sidebar + top bar persistent). No full-page routes outside the shell.

### Claude's Discretion
- Mobile sidebar drawer animation (slide direction, overlay backdrop)
- Exact skeleton shimmer block arrangement
- Whether avatar shows initials or generic icon when no profile image exists
- Dropdown component implementation details (portal vs inline)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### App shell layout & navigation
- `designs/TEAM_MANAGER_SPEC.md` — Global Shell section (sidebar nav items, active states, top bar elements, breadcrumb format)
- `designs/UX_SPEC.md` — Section 2.1 (Top Navigation Bar) and Section 2.2 (Sidebar Navigation)

### Page titles and subtitles for placeholder screens
- `designs/TEAM_MANAGER_SPEC.md` — Section 1.1, 2.1, 3.1, 5.1, 6.1 (Page Headers for each screen)

### Design tokens & existing components
- `source/dashboard/app/frontend/styles/application.css` — Theme tokens (colors, typography)
- `source/dashboard/app/frontend/components/ui/` — Existing Card, Badge, Button, Table, Input, StatusDot components

### Tech stack
- `CLAUDE.md` — React Router v7.13.2, Font Awesome icons, Devise auth, Zustand for UI state

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Card` component (`components/ui/Card.tsx`) — Use for wrapping placeholder screen content
- `Badge` component (`components/ui/Badge.tsx`) — Use for Approvals nav badge count
- `cn()` utility (`lib/utils.ts`) — Conditional class composition
- `Input` component (`components/ui/Input.tsx`) — Potential base for search input styling
- Tailwind theme tokens in `application.css` — All dark-mode colors defined (`--color-background`, `--color-surface`, `--color-accent`, etc.)

### Established Patterns
- Components live in `app/frontend/components/ui/` with TypeScript
- Tailwind utility classes referencing `@theme` tokens (e.g., `bg-surface`, `text-accent`)
- Desktop-first responsive approach (Phase 2, D-09)
- Font Awesome 6 for icons with tree-shaking via `@fortawesome/react-fontawesome`

### Integration Points
- `App.tsx` — Currently renders Phase 2 demo page; needs to become the router entry point
- Devise sessions — Sign out action needs to hit `DELETE /users/sign_out`
- Zustand — Sidebar collapse state (mobile open/closed) is client UI state

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

- Real search results / search-as-you-type — depends on data layer (Phase 4+) and pg_search (ENHN-02)
- Notification dropdown with real items — notification system is v2 (ENHN-01)
- Dedicated /profile route — link to /settings for now, separate profile page can be added later

</deferred>

---

*Phase: 03-app-shell*
*Context gathered: 2026-03-26*
