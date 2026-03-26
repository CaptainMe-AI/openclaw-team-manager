# Phase 3: App Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-03-26
**Phase:** 03-App Shell
**Mode:** discuss
**Areas discussed:** Placeholder screens, Search & notification interactivity, User account dropdown

## Areas Presented

| Area | Discussed? |
|------|-----------|
| Sidebar collapse behavior | No — user skipped, spec defaults applied (w-64 desktop, hamburger mobile) |
| Placeholder screens | Yes |
| Search & notification interactivity | Yes |
| User account dropdown | Yes |

## Discussion Details

### Placeholder screens
- **Q:** What should unbuilt screen routes show?
  - **A:** Skeleton mockup (shimmer blocks approximating layout)
- **Q:** Unique per screen or generic?
  - **A:** Generic skeleton for all — one reusable component

### Search & notification interactivity
- **Q:** '/' keyboard shortcut to focus search — wire up now or visual only?
  - **A:** Wire up now — focus behavior works, no search results
- **Q:** Notification bell behavior?
  - **A:** Static icon with unread dot — no dropdown, no click handler

### User account dropdown
- **Q:** What items in the avatar dropdown?
  - **A:** All four: Display name + email, Settings link, Profile link, Sign Out
- **Q:** Profile link destination?
  - **A:** Link to /settings (no new /profile route)

## Skipped Areas

### Sidebar collapse behavior
Skipped by user. Defaults applied from TEAM_MANAGER_SPEC.md:
- Desktop: fixed w-64, always expanded
- Mobile: collapsible via hamburger

---

*Phase: 03-app-shell*
*Discussion: 2026-03-26*
