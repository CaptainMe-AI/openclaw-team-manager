# Phase 2: Design System - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

A dark-mode component library and theme tokens that all screens share, preventing visual divergence. Delivers reusable typed React components, completes the design token system, and establishes responsive breakpoints. No screens — just the shared building blocks.

</domain>

<decisions>
## Implementation Decisions

### Component Architecture
- **D-01:** Build standalone typed React component files in `app/frontend/components/ui/` with TypeScript props (variant, size, state, etc.). Each component is a single file exporting a named function component.
- **D-02:** Create a `cn()` utility using `clsx` + `tailwind-merge` at `app/frontend/lib/utils.ts` for conditional class composition throughout all components.
- **D-03:** Components use Tailwind utility classes referencing `@theme` tokens — no inline styles, no CSS modules, no styled-components.

### Design Fidelity
- **D-04:** Match the HTML mockups in `designs/html/` closely for colors, spacing, and layout structure. Improve accessibility, hover/focus/active states, and interaction polish where the static mockups can't express them.
- **D-05:** Extract exact spacing, font sizes, border radii, and color usage from the mockups as the source of truth for component styling.

### Component Scope
- **D-06:** Phase 2 builds the 6 components required by DSGN-03: Card, Badge, Button, Table, Input, StatusDot — plus the `cn()` utility.
- **D-07:** Specialized components (Modal, Dropdown, Sparkline, Kanban columns, Charts) are deferred to the screen phases that need them (Phases 5-10).
- **D-08:** Each component supports variants/props visible in the mockups (e.g., Button: primary/danger/ghost, Badge: status colors, StatusDot: active/idle/error/disabled).

### Responsive Strategy
- **D-09:** Desktop-first responsive approach. Components and layouts are designed for desktop data density, then adapted down for tablet (640-1024px) and mobile (<640px).
- **D-10:** Breakpoints use Tailwind's default: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`. Desktop is the default, mobile/tablet use responsive overrides.
- **D-11:** Tables switch to card/list layout on mobile. Cards stack vertically. Sidebar collapses (handled in Phase 3).

### Theme Tokens
- **D-12:** Extend the existing `@theme` block in `application.css` with any additional tokens discovered from the mockups (shadows, border-radius scale, spacing scale if needed). Do NOT replace the 11 existing color tokens — only add.
- **D-13:** All component color references use Tailwind theme classes (`bg-surface`, `text-accent`, etc.) — never raw hex values in component files.

### Claude's Discretion
- Exact prop API design for each component (which props, naming conventions)
- Whether to add a component demo/preview page for visual testing
- Additional theme tokens beyond colors (shadows, spacing) based on mockup analysis
- Animation/transition choices for interactive states

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design mockups (primary visual reference)
- `designs/html/1-OpenClaw Command - Approvals D.html` — Approvals screen layout, card patterns, badge usage
- `designs/html/2-OpenClaw Command - Settings Ov.html` — Settings screen, form inputs, tab navigation
- `designs/html/3-OpenClaw Command - OpenClaw Da.html` — Dashboard overview, KPI cards, tables, timeline
- `designs/html/4-OpenClaw Command - Agents Over.html` — Agent fleet, grid cards, status dots, sparklines
- `designs/html/5-OpenClaw Command - Task Manage.html` — Task board, kanban cards, priority badges
- `designs/html/6-OpenClaw - New Task.html` — Modal dialog, form layout
- `designs/html/7-OpenClaw Command - Usage Overv.html` — Usage charts, KPI cards, button groups
- `designs/png/screenshot_1.png` through `screenshot_7.png` — Visual screenshots of each screen

### Design specs
- `designs/TEAM_MANAGER_SPEC.md` — Full UI spec with component details, data mappings, color usage
- `designs/UX_SPEC.md` — Layout patterns, interaction conventions, responsive behavior

### Technology stack
- `CLAUDE.md` §Technology Stack — clsx, tailwind-merge, recharts, @dnd-kit, font-awesome versions and usage

### Existing code
- `source/dashboard/app/frontend/styles/application.css` — Current @theme tokens (11 colors, 2 font families)
- `source/dashboard/app/frontend/components/App.tsx` — Current root component pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `application.css` @theme block: 11 color tokens and 2 font families already defined and working
- `App.tsx`: Demonstrates Tailwind utility class usage with theme tokens (bg-background, text-accent, text-text-secondary)
- Devise login page: Already uses theme tokens for dark-themed form (bg-surface, border-border, bg-accent for button)

### Established Patterns
- Tailwind v4 CSS-first configuration via `@tailwindcss/vite` plugin
- `@source` directive for ERB template scanning
- Vite entrypoint imports CSS (not vite_stylesheet_tag)
- No React import needed (react-jsx transform configured)

### Integration Points
- New components go in `app/frontend/components/ui/` (new directory)
- `cn()` utility goes in `app/frontend/lib/utils.ts` (new directory)
- Components will be imported by screen components in Phases 3-10
- Existing `application.css` @theme block is extended, not replaced

</code_context>

<specifics>
## Specific Ideas

- Components should follow the pattern shown in the discussion: named exports, destructured props with defaults, `cn()` for class merging
- The HTML mockups in `designs/html/` are the visual source of truth — extract exact values from them
- User prefers request specs over controller specs (from Phase 1) — same testing philosophy likely applies

</specifics>

<deferred>
## Deferred Ideas

- Sparkline component — deferred to Phase 5 (Agent Fleet) where it's first used
- Modal/Dialog component — deferred to Phase 6 (Task Board) for Create New Task
- Dropdown/Select component — deferred to Phase 3 (App Shell) or Phase 6
- Chart components (area, bar, donut, histogram) — deferred to Phase 8 (Usage & Cost)
- Kanban column/drag components — deferred to Phase 6 (Task Board)
- Storybook or component catalog — not required, Claude's discretion for a demo page

</deferred>

---

*Phase: 02-design-system*
*Context gathered: 2026-03-25*
