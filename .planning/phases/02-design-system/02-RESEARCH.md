# Phase 2: Design System - Research

**Researched:** 2026-03-25
**Domain:** React component library, Tailwind CSS v4 theming, dark-mode design system
**Confidence:** HIGH

## Summary

Phase 2 builds the shared design system layer: theme tokens in CSS, a `cn()` utility for class merging, and 6 reusable typed React components (Card, Badge, Button, Table, Input, StatusDot). These components form the foundation consumed by all screen phases (3-10). The existing codebase already has 11 color tokens and 2 font families in `application.css`, a working Tailwind v4 + Vite pipeline, and a TypeScript configuration with `@/*` path alias support.

The HTML mockups in `designs/html/` are the definitive visual reference. I extracted exact class patterns for every component from these mockups, cross-referenced across all 7 screens to identify consistent patterns versus one-off variations. The mockups use Tailwind v3 CDN syntax (`bg-surfaceHover`, `text-textPrimary`) while the existing `application.css` uses Tailwind v4 CSS-first `@theme` syntax with kebab-case tokens (`bg-surface-hover`, `text-text-primary`). This naming translation is a critical detail that affects every component.

**Primary recommendation:** Build components as standalone `.tsx` files in `app/frontend/components/ui/`, each exporting a named function component with typed props. Use the existing `@theme` block as the single source of truth for tokens, extending it with priority colors, chart colors, and a card-glow shadow. Install `clsx` + `tailwind-merge` as the only new npm dependencies.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Build standalone typed React component files in `app/frontend/components/ui/` with TypeScript props (variant, size, state, etc.). Each component is a single file exporting a named function component.
- **D-02:** Create a `cn()` utility using `clsx` + `tailwind-merge` at `app/frontend/lib/utils.ts` for conditional class composition throughout all components.
- **D-03:** Components use Tailwind utility classes referencing `@theme` tokens -- no inline styles, no CSS modules, no styled-components.
- **D-04:** Match the HTML mockups in `designs/html/` closely for colors, spacing, and layout structure. Improve accessibility, hover/focus/active states, and interaction polish where the static mockups can't express them.
- **D-05:** Extract exact spacing, font sizes, border radii, and color usage from the mockups as the source of truth for component styling.
- **D-06:** Phase 2 builds the 6 components required by DSGN-03: Card, Badge, Button, Table, Input, StatusDot -- plus the `cn()` utility.
- **D-07:** Specialized components (Modal, Dropdown, Sparkline, Kanban columns, Charts) are deferred to the screen phases that need them (Phases 5-10).
- **D-08:** Each component supports variants/props visible in the mockups (e.g., Button: primary/danger/ghost, Badge: status colors, StatusDot: active/idle/error/disabled).
- **D-09:** Desktop-first responsive approach. Components and layouts are designed for desktop data density, then adapted down for tablet (640-1024px) and mobile (<640px).
- **D-10:** Breakpoints use Tailwind's default: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`. Desktop is the default, mobile/tablet use responsive overrides.
- **D-11:** Tables switch to card/list layout on mobile. Cards stack vertically. Sidebar collapses (handled in Phase 3).
- **D-12:** Extend the existing `@theme` block in `application.css` with any additional tokens discovered from the mockups (shadows, border-radius scale, spacing scale if needed). Do NOT replace the 11 existing color tokens -- only add.
- **D-13:** All component color references use Tailwind theme classes (`bg-surface`, `text-accent`, etc.) -- never raw hex values in component files.

### Claude's Discretion
- Exact prop API design for each component (which props, naming conventions)
- Whether to add a component demo/preview page for visual testing
- Additional theme tokens beyond colors (shadows, spacing) based on mockup analysis
- Animation/transition choices for interactive states

### Deferred Ideas (OUT OF SCOPE)
- Sparkline component -- deferred to Phase 5 (Agent Fleet) where it's first used
- Modal/Dialog component -- deferred to Phase 6 (Task Board) for Create New Task
- Dropdown/Select component -- deferred to Phase 3 (App Shell) or Phase 6
- Chart components (area, bar, donut, histogram) -- deferred to Phase 8 (Usage & Cost)
- Kanban column/drag components -- deferred to Phase 6 (Task Board)
- Storybook or component catalog -- not required, Claude's discretion for a demo page
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSGN-01 | Dark theme with spec color tokens (background #0f1219, surface #1a1f2e, accent #00d4aa, etc.) | Existing 11 tokens verified in `application.css`. Additional tokens needed: 4 priority colors, 5 chart colors, card-glow shadow. All hex values extracted from mockups. |
| DSGN-02 | Typography system -- Inter for UI text, JetBrains Mono for data/metrics | Google Fonts already loaded in `application.html.erb`. Font weights need expanding from 400,600 to 300,400,500,600,700 for Inter and 400,500,700 for JetBrains Mono. `@theme` already has `--font-sans` and `--font-mono` configured. |
| DSGN-03 | Reusable component library: cards, badges, buttons, tables, inputs, status dots, sparklines | 6 of 7 components built in this phase (sparkline deferred per D-07). Exact Tailwind class patterns extracted from all 7 HTML mockups for each component. |
| DSGN-04 | Responsive breakpoints -- mobile (<640px), tablet (640-1024px), desktop (>1024px) | Mockups use `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`. Desktop-first per D-09. Components need responsive props or built-in responsive behavior. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech stack**: Ruby 3.3.3, Rails 8.0.5, React 19.2, PostgreSQL 17, Vite (via vite_rails), Tailwind CSS v4.2
- **App location**: `source/dashboard`
- **Assets**: vite_rails for React, Tailwind for styling
- **Serialization**: jbuilder (not relevant for this phase, but do not add AMS)
- **Testing**: RSpec, Factory Bot, Faker, Playwright with cypress-on-rails, RuboCop
- **Avoid**: styled-components, CSS modules, axios, Moment.js (use date-fns), kaminari
- **Icons**: Font Awesome 6.4.0 (`fa-solid` weight) via `@fortawesome/react-fontawesome`
- **Styling utilities**: clsx + tailwind-merge for `cn()` utility
- **TypeScript**: Required for React frontend

## Standard Stack

### Core (This Phase)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| clsx | 2.1.1 | Conditional className composition | 228B, standard for Tailwind + React conditional class logic. Verified via npm registry. |
| tailwind-merge | 3.5.0 | Tailwind class conflict resolution | Prevents conflicting Tailwind classes when merging base + override styles. Verified via npm registry. |

### Already Installed (Used by this phase)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| react | ^19.2.4 | Component rendering | In package.json |
| @tailwindcss/vite | ^4.2.2 | Tailwind CSS v4 Vite plugin | In package.json |
| typescript | ^6.0.2 | Type safety | In package.json |
| @types/react | ^19.2.14 | React type definitions | In package.json |
| @types/react-dom | ^19.2.3 | React DOM type definitions | In package.json |

### NOT Needed This Phase
| Library | Why Deferred |
|---------|-------------|
| @fortawesome/react-fontawesome | Font Awesome icons are used by App Shell (Phase 3), not by base components. Components take `children` or render text, not icons directly. |
| react-router | Routing is Phase 3 (App Shell) |
| @tanstack/react-query | Data fetching is Phase 4 (Data Layer) |
| zustand | UI state is Phase 3+ |
| recharts | Charts are Phase 8 |
| @dnd-kit/* | Kanban is Phase 6 |

**Installation:**
```bash
cd source/dashboard && npm install clsx@^2.1.1 tailwind-merge@^3.5.0
```

**Version verification:**
- clsx: 2.1.1 (verified via `npm view clsx version` on 2026-03-25)
- tailwind-merge: 3.5.0 (verified via `npm view tailwind-merge version` on 2026-03-25)

## Architecture Patterns

### Recommended Project Structure
```
app/frontend/
  components/
    ui/
      Card.tsx           # Surface container component
      Badge.tsx          # Status/priority label component
      Button.tsx         # Action button component
      Table.tsx          # Data table component
      Input.tsx          # Form input component
      StatusDot.tsx      # Colored status indicator
      index.ts           # Barrel export file
    App.tsx              # Existing root component
  lib/
    utils.ts             # cn() utility function
  entrypoints/
    application.tsx      # Existing entrypoint
  styles/
    application.css      # Existing theme tokens (extended)
```

### Pattern 1: cn() Utility
**What:** A utility function combining `clsx` and `tailwind-merge` for safe class composition.
**When to use:** Every component that accepts `className` as a prop. Always use `cn()` instead of raw template literals for class strings.
**Example:**
```typescript
// app/frontend/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Pattern 2: Component File Structure
**What:** Each component is a single file with typed props interface, default prop values, and a named export.
**When to use:** All 6 UI components follow this pattern.
**Example:**
```typescript
// app/frontend/components/ui/Button.tsx
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-md transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
        // variant styles
        variant === "primary" && "bg-accent text-background hover:bg-accent-hover",
        variant === "secondary" && "bg-surface border border-border text-text-primary hover:bg-surface-hover",
        variant === "danger" && "bg-transparent border border-danger text-danger hover:bg-danger/10",
        variant === "ghost" && "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
        // size styles
        size === "sm" && "px-2 py-1 text-xs gap-1.5",
        size === "md" && "px-3 py-1.5 text-sm gap-2",
        size === "lg" && "px-4 py-2 text-sm gap-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Pattern 3: Barrel Exports
**What:** An `index.ts` file that re-exports all UI components for clean imports.
**When to use:** Consumers import from `@/components/ui` rather than individual files.
**Example:**
```typescript
// app/frontend/components/ui/index.ts
export { Button } from "./Button";
export { Card } from "./Card";
export { Badge } from "./Badge";
export { Table } from "./Table";
export { Input } from "./Input";
export { StatusDot } from "./StatusDot";
```

### Pattern 4: Tailwind v4 Token Naming Convention
**What:** Tailwind v4 CSS-first config uses `@theme` block with CSS custom property naming. The `--color-` prefix maps to `bg-`, `text-`, `border-` utilities. Kebab-case in CSS becomes kebab-case in utility classes.
**Critical detail:** The mockups use Tailwind v3 CDN with camelCase token names (`textPrimary`, `surfaceHover`). The existing `application.css` already uses Tailwind v4 kebab-case (`text-primary`, `surface-hover`). The Tailwind v4 `@theme` block automatically strips the `--color-` prefix, so:
- `--color-text-primary: #f3f4f6` becomes the utility class `text-text-primary` (for text color) or `bg-text-primary` (for background)
- `--color-surface-hover: #252b3d` becomes `bg-surface-hover`

This is already established in the existing code (`App.tsx` uses `bg-background`, `text-accent`, `text-text-secondary`).

### Anti-Patterns to Avoid
- **Raw hex values in components:** Never write `className="text-[#00d4aa]"`. Always use token classes like `text-accent`.
- **Inline styles for colors/spacing:** Use Tailwind utilities exclusively. The only exception is dynamic values from props that cannot be pre-defined (rare in this phase).
- **Hardcoded responsive breakpoints in CSS:** Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`), not `@media` queries.
- **Importing components individually without barrel:** Always export from `index.ts` and import from `@/components/ui`.
- **Using React.FC type annotation:** Use explicit props destructuring with interface. `React.FC` is unnecessary with the `react-jsx` transform.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Class name merging | String concatenation or template literals | `cn()` with clsx + tailwind-merge | Template literals can't handle conditional classes cleanly, and conflicting Tailwind classes (e.g., `px-2` and `px-4`) need intelligent resolution |
| Focus ring styles | Custom CSS for focus states | Tailwind `focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background` | Consistent focus indicators across all interactive components, proper offset for dark background |
| Responsive breakpoints | Custom media queries | Tailwind `sm:`, `md:`, `lg:`, `xl:` prefixes | Already configured, works with the token system, consistent across all components |

**Key insight:** The design system is entirely achievable with Tailwind utility classes and the `cn()` utility. No additional CSS framework, runtime styling library, or complex build tooling is needed.

## Common Pitfalls

### Pitfall 1: Tailwind v4 Token Name Mismatch
**What goes wrong:** Components use v3 camelCase names from mockups (`bg-surfaceHover`, `text-textPrimary`) instead of v4 kebab-case names from the `@theme` block (`bg-surface-hover`, `text-text-primary`).
**Why it happens:** The HTML mockups use Tailwind v3 CDN with a JavaScript config, but the actual project uses Tailwind v4 CSS-first config.
**How to avoid:** Always reference the existing `application.css` for the canonical token names. The mapping is:
- `surfaceHover` in mockup = `surface-hover` in Tailwind v4 = `bg-surface-hover` utility
- `textPrimary` in mockup = `text-primary` in Tailwind v4 = `text-text-primary` utility
- `textSecondary` in mockup = `text-secondary` in Tailwind v4 = `text-text-secondary` utility
- `accentHover` in mockup = `accent-hover` in Tailwind v4 = `bg-accent-hover` / `hover:bg-accent-hover` utility
**Warning signs:** Components render with wrong colors or no colors at all (Tailwind purges unrecognized class names).

### Pitfall 2: Missing `@/*` Path Alias in Vite
**What goes wrong:** TypeScript `@/*` path alias works for type checking but not at runtime because Vite doesn't know about it.
**Why it happens:** `tsconfig.json` has `paths: { "@/*": ["app/frontend/*"] }` but `vite.config.mts` has no corresponding `resolve.alias`.
**How to avoid:** Add a `resolve.alias` to `vite.config.mts`:
```typescript
import path from "path";
// ...
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "app/frontend"),
    },
  },
  plugins: [ViteRails(), tailwindcss()],
});
```
**Warning signs:** Imports like `import { cn } from "@/lib/utils"` fail at build time even though the IDE resolves them.

### Pitfall 3: Incomplete Google Fonts Weight Loading
**What goes wrong:** Font weight 300 (light), 500 (medium), or 700 (bold) renders as the browser's fallback synthesis instead of the actual font file.
**Why it happens:** The current `application.html.erb` only loads Inter weights 400 and 600, and JetBrains Mono weights 400 and 700. The mockups use Inter at weights 300, 400, 500, 600, 700 and JetBrains Mono at 400, 500, 700.
**How to avoid:** Update the Google Fonts URL to include all needed weights:
```
Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700
```
**Warning signs:** `font-light` or `font-medium` text looks slightly wrong (faux-bold or faux-light synthesis).

### Pitfall 4: Tailwind v4 Opacity Modifier Syntax
**What goes wrong:** Color opacity modifiers like `bg-success/10` or `border-success/20` don't work with custom theme colors.
**Why it happens:** In Tailwind v4 CSS-first config, custom colors defined in `@theme` may need to be specified as channels (not opaque hex) for opacity modifiers to work. However, Tailwind v4 automatically handles hex-to-channel conversion for `@theme` colors, so `bg-success/10` should work if the color is `#10b981`.
**How to avoid:** Test opacity modifiers early with a simple component. If they don't work, the fallback is to define additional explicit tokens like `--color-success-10: rgb(16 185 129 / 0.1)` in the `@theme` block.
**Warning signs:** Badge backgrounds render as fully opaque instead of semi-transparent tinted backgrounds.

### Pitfall 5: TypeScript Strict Mode and Optional Props
**What goes wrong:** Components fail to compile because props like `className` are `string | undefined` but are passed directly to `cn()`.
**Why it happens:** `tsconfig.json` has `"strict": true` which includes `strictNullChecks`.
**How to avoid:** The `cn()` utility from clsx already handles `undefined` values gracefully -- it simply ignores them. Always pass `className` as the last argument to `cn()` so overrides work properly.
**Warning signs:** TypeScript errors about `undefined` not being assignable.

## Mockup-Extracted Component Specifications

### Card Component
Extracted from all 7 mockups. Two distinct Card patterns:

**Standard Card (most common):**
```
bg-surface rounded-lg border border-border p-5
hover:border-text-secondary transition-colors
```
Seen in: Dashboard KPI cards, Agent Fleet cards, Usage KPI cards

**Glow Card (panels, section containers):**
```
bg-surface rounded-lg border border-border
card-glow (box-shadow: 0 4px 20px rgba(0,0,0,0.2))
overflow-hidden
```
Seen in: Approvals panel, Settings panels, Usage chart containers

**Props to support:** `variant` (default/glow), `className` override, `padding` (boolean, default true), `children`.

### Badge Component
Two distinct Badge patterns across mockups:

**Status Badge (with dot indicator):**
```
inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium
bg-{color}/10 text-{color} border border-{color}/20
```
Colors: success (active/completed), danger (error/failed), warning (waiting), blue-500 (in-progress), text-secondary (idle/offline)
Seen in: Agent status, Task status, History table decisions

**Priority Badge (text-only):**
```
text-[10px] font-medium px-1.5 py-0.5 rounded
text-{priority} bg-{priority}/10 border border-{priority}/20
```
Priority colors: priority-0 (#ef4444/red), priority-1 (#f59e0b/amber), priority-2 (#3b82f6/blue), priority-3 (#9ca3af/gray)
Seen in: Task cards, Approval cards

**Props to support:** `variant` (status/priority), `color` (success/danger/warning/info/idle for status; p0/p1/p2/p3 for priority), `children`, `dot` (boolean for status dot), `pulse` (boolean for animate-pulse on dot).

### Button Component
Four distinct Button patterns:

**Primary:** `bg-accent text-background hover:bg-accent-hover px-3 py-1.5 rounded-md text-sm font-medium`
Optional glow: `shadow-[0_0_10px_rgba(0,212,170,0.3)]`
Seen in: "New Task", "Save Configuration", "Approve All"

**Secondary:** `bg-surface border border-border text-text-primary hover:bg-surface-hover px-3 py-1.5 rounded-md text-sm font-medium`
Seen in: "Last 24 Hours", "Discard Changes", "Export Report"

**Danger:** `bg-transparent border border-danger text-danger hover:bg-danger/10 px-3 py-1.5 rounded-md text-sm font-medium`
Seen in: "Deny" buttons in approvals

**Ghost:** `bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary px-3 py-1.5 rounded-md text-sm font-medium`
Seen in: filter buttons, clear button

**Props to support:** `variant` (primary/secondary/danger/ghost), `size` (sm/md/lg), `glow` (boolean for primary variant), `disabled`, `className`, `children`, all standard `ButtonHTMLAttributes`.

### Table Component
Single consistent Table pattern across Dashboard and Agents screens:

**Structure:**
```
table: w-full text-left border-collapse
thead > tr: bg-surface-hover/50 text-xs text-text-secondary uppercase tracking-wider
th: p-4 font-medium
tbody: text-sm divide-y divide-border
tr: hover:bg-surface-hover/30 transition-colors cursor-pointer
td: p-4
```
Data cells use `font-mono text-text-secondary text-xs` for numeric/time values.
Seen in: Dashboard Recent Tasks, Agent Fleet table view, Approval History

**Props to support:** Generic typed table component with `columns` definition array, `data` array, `onRowClick`, `className`. Column definitions specify header text, accessor key, cell renderer, and alignment.

### Input Component
Consistent Input pattern from Settings and search bar:

```
w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-text-primary
placeholder-text-secondary
focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
transition-colors
```
Seen in: Settings form fields, Search bar (with icon prefix)

**Props to support:** All standard `InputHTMLAttributes`, plus `label` (optional), `helperText` (optional), `error` (optional string), `icon` (optional ReactNode for left icon), `className`.

### StatusDot Component
Two sizes used across mockups:

**Small (1.5):** `w-1.5 h-1.5 rounded-full` -- used inline within badges and table cells
**Standard (2):** `w-2 h-2 rounded-full` -- used in legend indicators and standalone status

**Colors:** success (green), danger (red), warning (amber), info (blue-400), idle (text-secondary), offline (border color)
**Animation:** `animate-pulse` for active/in-progress states

**Props to support:** `status` (active/idle/error/warning/info/offline), `size` (sm/md), `pulse` (boolean), `className`.

## Additional Theme Tokens Needed

The existing `application.css` has 11 color tokens and 2 font families. Based on mockup analysis, the following tokens need to be **added** (not replacing existing ones):

### Priority Colors (from Task Board and Approvals mockups)
```css
@theme {
  /* existing tokens preserved... */

  /* Priority Colors */
  --color-priority-0: #ef4444;  /* Red - P0/Critical (same as danger) */
  --color-priority-1: #f59e0b;  /* Amber - P1/High (same as warning) */
  --color-priority-2: #3b82f6;  /* Blue - P2/Medium */
  --color-priority-3: #9ca3af;  /* Gray - P3/Low (same as text-secondary) */

  /* Chart Colors (from Usage screen) */
  --color-chart-1: #00d4aa;  /* Teal (same as accent) */
  --color-chart-2: #3b82f6;  /* Blue */
  --color-chart-3: #8b5cf6;  /* Purple */
  --color-chart-4: #f43f5e;  /* Rose */
  --color-chart-5: #f59e0b;  /* Amber (same as warning) */

  /* Info color (used for "In Progress" state, distinct from accent) */
  --color-info: #3b82f6;  /* Blue-500 */
}
```

### Shadow Token (used across most screens as `.card-glow`)
The `card-glow` shadow (`box-shadow: 0 4px 20px rgba(0,0,0,0.2)`) is used extensively. This should be defined as a CSS utility class rather than a theme token, since Tailwind v4 `@theme` does not support shadow tokens the same way. Add it as a utility in the CSS:

```css
@utility card-glow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
```

### Scrollbar Styles
All mockups include custom scrollbar styling. Add as base CSS:
```css
@layer base {
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--color-background); }
  ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #4a5568; }
}
```

### Font Weight Loading Fix
Current `application.html.erb` loads only Inter:400,600 and JetBrains Mono:400,700. The mockups use:
- Inter: 300 (light labels), 400 (body), 500 (medium/nav items), 600 (semibold headings), 700 (bold headings)
- JetBrains Mono: 400 (data values), 500 (emphasized data), 700 (bold data)

Update Google Fonts URL to:
```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap
```

## Code Examples

### cn() Utility Implementation
```typescript
// Source: clsx + tailwind-merge pattern (standard community pattern)
// app/frontend/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Card Component (extracted from mockups)
```typescript
// app/frontend/components/ui/Card.tsx
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glow";
  padding?: boolean;
}

export function Card({
  variant = "default",
  padding = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-lg border border-border",
        variant === "default" && "hover:border-text-secondary transition-colors",
        variant === "glow" && "card-glow overflow-hidden",
        padding && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Badge Component (extracted from mockups)
```typescript
// app/frontend/components/ui/Badge.tsx
import { cn } from "@/lib/utils";
import { StatusDot } from "./StatusDot";

type BadgeColor = "success" | "danger" | "warning" | "info" | "idle";
type PriorityLevel = "p0" | "p1" | "p2" | "p3";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "status" | "priority";
  color?: BadgeColor;
  priority?: PriorityLevel;
  dot?: boolean;
  pulse?: boolean;
}

const statusColorMap: Record<BadgeColor, string> = {
  success: "bg-success/10 text-success border-success/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
  idle: "bg-text-secondary/10 text-text-secondary border-text-secondary/20",
};

const priorityColorMap: Record<PriorityLevel, string> = {
  p0: "bg-priority-0/10 text-priority-0 border-priority-0/20",
  p1: "bg-priority-1/10 text-priority-1 border-priority-1/20",
  p2: "bg-priority-2/10 text-priority-2 border-priority-2/20",
  p3: "bg-priority-3/10 text-priority-3 border-priority-3/20",
};

export function Badge({
  variant = "status",
  color = "success",
  priority = "p2",
  dot = false,
  pulse = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const colorClasses = variant === "status"
    ? statusColorMap[color]
    : priorityColorMap[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border",
        colorClasses,
        className
      )}
      {...props}
    >
      {dot && <StatusDot status={color} size="sm" pulse={pulse} />}
      {children}
    </span>
  );
}
```

### StatusDot Component (extracted from mockups)
```typescript
// app/frontend/components/ui/StatusDot.tsx
import { cn } from "@/lib/utils";

type DotStatus = "active" | "idle" | "error" | "warning" | "info" | "offline" | "success" | "danger";

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: DotStatus;
  size?: "sm" | "md";
  pulse?: boolean;
}

const dotColorMap: Record<DotStatus, string> = {
  active: "bg-success",
  success: "bg-success",
  idle: "bg-text-secondary",
  error: "bg-danger",
  danger: "bg-danger",
  warning: "bg-warning",
  info: "bg-info",
  offline: "bg-border",
};

export function StatusDot({
  status = "active",
  size = "sm",
  pulse = false,
  className,
  ...props
}: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full",
        size === "sm" && "w-1.5 h-1.5",
        size === "md" && "w-2 h-2",
        dotColorMap[status],
        pulse && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}
```

### Vite Path Alias Configuration
```typescript
// vite.config.mts (updated)
import { defineConfig } from "vite";
import ViteRails from "vite-plugin-rails";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "app/frontend"),
    },
  },
  plugins: [
    ViteRails(),
    tailwindcss(),
  ],
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 JavaScript config (`tailwind.config.js`) | Tailwind v4 CSS-first config (`@theme` in CSS) | Tailwind v4 (Jan 2025) | No config file needed. Tokens live in CSS. `@theme` block replaces `theme.extend.colors`. |
| PostCSS plugin for Tailwind | `@tailwindcss/vite` Vite plugin | Tailwind v4 | Faster processing, no `postcss.config.js` needed. Already configured. |
| `React.FC` type annotation | Explicit props with interface | React community convention ~2022 | Simpler, no implicit `children` prop issues. Match existing `App.tsx` pattern. |
| CSS-in-JS (styled-components) | Tailwind utility classes | Project constraint | Zero runtime CSS, atomic classes, design token alignment. |
| Component libraries (MUI, Chakra) | Custom components with Tailwind | Project decision | Lighter bundle, exact design match, no theme override wrestling. |

**Deprecated/outdated:**
- `React.FC` type annotation: Removed implicit `children` in React 18+. Use explicit props.
- `tailwind.config.js`: Replaced by `@theme` block in Tailwind v4 CSS-first config.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | RSpec 8.0.4 + Playwright 1.58.2 |
| Config file | `source/dashboard/spec/rails_helper.rb` (RSpec), playwright config TBD |
| Quick run command | `cd source/dashboard && bundle exec rspec spec/ --fail-fast` |
| Full suite command | `cd source/dashboard && bundle exec rspec` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-01 | Dark theme renders with correct colors (no white flashes) | E2E (Playwright) | `cd source/dashboard && npx playwright test tests/e2e/design_system.spec.ts` | No - Wave 0 |
| DSGN-02 | Inter and JetBrains Mono fonts load and render | E2E (Playwright) | `cd source/dashboard && npx playwright test tests/e2e/design_system.spec.ts` | No - Wave 0 |
| DSGN-03 | Components render correctly with all prop variants | E2E (Playwright) | `cd source/dashboard && npx playwright test tests/e2e/design_system.spec.ts` | No - Wave 0 |
| DSGN-04 | Layout adapts across mobile/tablet/desktop viewports | E2E (Playwright) | `cd source/dashboard && npx playwright test tests/e2e/design_system.spec.ts` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** TypeScript compilation check (`cd source/dashboard && npx tsc --noEmit`)
- **Per wave merge:** Full Playwright E2E suite
- **Phase gate:** All E2E tests green, visual inspection of component demo page

### Wave 0 Gaps
- [ ] `source/dashboard/tests/e2e/design_system.spec.ts` -- covers DSGN-01 through DSGN-04 (Playwright E2E)
- [ ] Playwright config for the project (may already exist from Phase 1 setup with cypress-on-rails)
- [ ] Component demo route/page for visual testing of all component variants

**Testing approach for this phase:** Since this phase produces React components with no backend logic, the primary validation is:
1. **TypeScript compilation** -- confirms all components are type-safe (`npx tsc --noEmit`)
2. **Visual E2E tests** -- Playwright tests that render components and verify colors, fonts, responsive behavior
3. **Manual visual inspection** -- Claude's discretion on whether to add a demo page at `/components` for easy visual verification

## Open Questions

1. **Vite path alias resolution**
   - What we know: `tsconfig.json` has `@/*` path alias configured. `vite.config.mts` does not have a corresponding `resolve.alias`.
   - What's unclear: Whether `vite-plugin-rails` or `vite-plugin-ruby` automatically resolves TypeScript path aliases. It likely does not.
   - Recommendation: Add `resolve.alias` to `vite.config.mts` as shown in Pitfall 2. Test by importing `cn()` from `@/lib/utils` in a component.

2. **Tailwind v4 opacity modifier support for custom theme colors**
   - What we know: Tailwind v4 supports `bg-color/opacity` syntax. The mockups use it extensively (e.g., `bg-success/10`, `border-success/20`).
   - What's unclear: Whether hex colors in `@theme` block automatically support opacity modifiers in Tailwind v4. Tailwind v4 documentation says it should, but this needs testing.
   - Recommendation: Test early with a simple `bg-success/10` class. If it doesn't work, define explicit opacity variants in the `@theme` block.

3. **Component demo page approach**
   - What we know: User left this as Claude's discretion. No Storybook requirement.
   - What's unclear: Whether a dedicated route is worth the effort for 6 components.
   - Recommendation: Create a simple demo page at a dev-only route (e.g., rendered by `App.tsx` temporarily) that shows all component variants. This makes visual verification trivial and costs minimal effort. Remove or guard behind environment check later.

## Sources

### Primary (HIGH confidence)
- `source/dashboard/app/frontend/styles/application.css` -- existing 11 color tokens and 2 font families
- `source/dashboard/app/frontend/components/App.tsx` -- existing component pattern and token usage
- `source/dashboard/tsconfig.json` -- TypeScript configuration with `@/*` path alias
- `source/dashboard/vite.config.mts` -- Vite configuration with Tailwind v4 plugin
- `source/dashboard/package.json` -- current dependencies
- `source/dashboard/app/views/layouts/application.html.erb` -- font loading, body classes
- `designs/html/*.html` -- all 7 HTML mockups (extracted exact class patterns)
- `designs/TEAM_MANAGER_SPEC.md` -- design system reference table
- `designs/UX_SPEC.md` -- layout patterns and interaction conventions
- `designs/png/screenshot_*.png` -- visual reference screenshots
- npm registry (`npm view clsx version` = 2.1.1, `npm view tailwind-merge version` = 3.5.0) -- current package versions

### Secondary (MEDIUM confidence)
- CLAUDE.md technology stack documentation -- library versions and compatibility matrix (internally maintained, current)
- Tailwind CSS v4 documentation -- `@theme` block syntax, CSS-first configuration

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources (existing code + mockups)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- only 2 new dependencies (clsx, tailwind-merge), versions verified against npm registry
- Architecture: HIGH -- patterns extracted directly from existing code and HTML mockups, consistent across all 7 screens
- Theme tokens: HIGH -- exact hex values extracted from mockup CSS, cross-verified across all screens
- Component specs: HIGH -- class patterns extracted from actual HTML, not documentation
- Pitfalls: HIGH -- identified from actual codebase gaps (font weights, path alias, token naming)

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable domain, no fast-moving dependencies)
