---
phase: 1
slug: foundation
status: draft
shadcn_initialized: false
preset: none
created: 2026-03-25
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for the foundation phase. Phase 1 produces a running Rails + React application with authentication. The UI surface is minimal: a Devise login page (ERB) and a placeholder React root component proving Vite + Tailwind pipeline works. This contract establishes the initial Tailwind v4 theme tokens that Phase 2 will expand into the full design system.

---

## Phase Scope

Phase 1 has exactly two rendered screens:

1. **Devise Login Page** -- Server-rendered ERB form for email/password authentication. Styled with Tailwind utility classes to match the dark theme direction. Not a React component.
2. **Authenticated Root** -- A single React component (`App.tsx`) mounted at `<div id="root">`, displaying an application title on a dark background. Proves Vite + React + Tailwind pipeline is functional.

No navigation, no sidebar, no data-driven components. Those are Phase 2 (design system) and Phase 3 (app shell).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none (Tailwind utility classes only in Phase 1; custom components start in Phase 2) |
| Icon library | Font Awesome 6 (`@fortawesome/react-fontawesome` + `@fortawesome/fontawesome-svg-core` + `@fortawesome/free-solid-svg-icons`) -- installed in Phase 1, used from Phase 2 onward |
| Font | Inter (UI text) + JetBrains Mono (data/metrics) -- loaded via Google Fonts or self-hosted |

**Source:** TEAM_MANAGER_SPEC.md Design System Reference, CLAUDE.md Technology Stack (Icons section)

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing, badge padding |
| md | 16px | Default element spacing, input padding, card padding |
| lg | 24px | Section padding, form field gaps |
| xl | 32px | Layout gaps, card group spacing |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing, login form vertical centering |

Exceptions: none

**Phase 1 usage:** Login form uses `lg` (24px) for field gaps, `md` (16px) for input padding, `3xl` (64px) for vertical centering. Root placeholder uses `md` (16px) for content padding.

---

## Typography

| Role | Size | Weight | Line Height | Font |
|------|------|--------|-------------|------|
| Body | 14px | 400 (regular) | 1.5 | Inter |
| Label | 12px | 500 (medium) | 1.4 | Inter |
| Heading | 20px | 600 (semibold) | 1.2 | Inter |
| Display | 28px | 700 (bold) | 1.2 | Inter |

**Data text** (Phase 2+): JetBrains Mono at 13px, weight 400, line-height 1.4. Not used in Phase 1 but the font is loaded in the CSS file so it is available immediately in Phase 2.

**Phase 1 usage:** Login page uses Heading (20px/600) for "OpenClaw Command Center" title, Body (14px/400) for form labels and inputs, Label (12px/500) for helper text. Root placeholder uses Display (28px/700) for the application title.

**Source:** TEAM_MANAGER_SPEC.md Typography section (Inter 300-700, JetBrains Mono 400-700). Sizes derived from design screenshots and component patterns.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#0f1219` | Page background (`--color-background`) |
| Secondary (30%) | `#1a1f2e` | Cards, panels, login form container (`--color-surface`) |
| Accent (10%) | `#00d4aa` | Login button, active states, links (`--color-accent`) |
| Destructive | `#ef4444` | Error messages on login form (`--color-danger`) |

### Full Token Palette (established in Phase 1 CSS, consumed from Phase 2 onward)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-background` | `#0f1219` | Page background |
| `--color-surface` | `#1a1f2e` | Cards, panels, sidebar |
| `--color-surface-hover` | `#252b3d` | Hover states, active filters |
| `--color-accent` | `#00d4aa` | CTA buttons, active nav, links |
| `--color-accent-hover` | `#00b38f` | Button hover state |
| `--color-text-primary` | `#f3f4f6` | Headings, body text |
| `--color-text-secondary` | `#9ca3af` | Subtitles, helper text, timestamps |
| `--color-border` | `#2d3748` | Card borders, dividers, input borders |
| `--color-danger` | `#ef4444` | Deny buttons, failed states, error text |
| `--color-warning` | `#f59e0b` | Amber alerts, warnings |
| `--color-success` | `#10b981` | Approve buttons, completed states |

**Source:** TEAM_MANAGER_SPEC.md Design System Reference -- Colors table. All values extracted directly from design HTML/CSS.

Accent reserved for: login submit button, "OpenClaw" wordmark highlight in root placeholder. No other accent usage in Phase 1.

---

## Tailwind v4 CSS Configuration

Phase 1 establishes the `@theme` block in `app/frontend/styles/application.css`. This is the single source of truth for all design tokens consumed by Tailwind utility classes.

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-background: #0f1219;
  --color-surface: #1a1f2e;
  --color-surface-hover: #252b3d;
  --color-accent: #00d4aa;
  --color-accent-hover: #00b38f;
  --color-text-primary: #f3f4f6;
  --color-text-secondary: #9ca3af;
  --color-border: #2d3748;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-success: #10b981;

  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

**Why all tokens in Phase 1:** Phase 2 (Design System) builds reusable components that consume these tokens. Establishing them in Phase 1 means Phase 2 can focus on components, not token discovery. The full palette is 11 colors -- small enough to declare upfront.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | "Sign In" (login form submit button) |
| Login page title | "OpenClaw Command Center" |
| Login page subtitle | "Sign in to manage your agent fleet." |
| Email label | "Email" |
| Password label | "Password" |
| Remember me label | "Remember me" |
| Login error (invalid credentials) | "Invalid email or password. Please try again." |
| Login error (account locked) | "Account locked. Contact your administrator." |
| Root placeholder heading | "OpenClaw Team Manager" |
| Root placeholder body | "Dashboard loading..." |
| Devise flash (signed in) | "Signed in successfully." |
| Devise flash (signed out) | "Signed out successfully." |
| Devise flash (session expired) | "Your session has expired. Please sign in again." |

**Destructive actions in Phase 1:** None. Sign-out is non-destructive (no confirmation needed).

---

## Login Page Visual Contract

The Devise login form is server-rendered ERB styled with Tailwind classes. It does NOT use React.

### Layout
- Full viewport height (`min-h-screen`), centered vertically and horizontally
- Background color: `--color-background` (`#0f1219`)
- Login card: `--color-surface` (`#1a1f2e`), `rounded-lg`, `border` with `--color-border`, max-width 400px
- Card padding: 32px (`xl` spacing token)

### Elements (top to bottom)
1. **Title**: "OpenClaw Command Center" -- 20px, weight 600, color `--color-text-primary`
2. **Subtitle**: "Sign in to manage your agent fleet." -- 14px, weight 400, color `--color-text-secondary`
3. **Email input**: Full width, `--color-background` fill, `--color-border` border, `--color-text-primary` text, focus ring `--color-accent`
4. **Password input**: Same styling as email input
5. **Remember me checkbox**: Inline with label, `--color-text-secondary` label text
6. **Sign In button**: Full width, `--color-accent` background, `#0f1219` text (dark on teal), `--color-accent-hover` on hover, 14px weight 600, 44px height (touch target)
7. **Error messages**: Below title, `--color-danger` text, 12px weight 500

### States
- **Default**: Form fields empty, button enabled
- **Error**: Red error text appears below subtitle, invalid fields get `--color-danger` border
- **Loading**: Button text changes to "Signing in..." (no spinner in Phase 1)

---

## Root Placeholder Visual Contract

The authenticated root page renders a minimal React component to prove the pipeline works.

### Layout
- Full viewport height (`min-h-screen`), centered vertically and horizontally
- Background color: `--color-background` (`#0f1219`)

### Elements
1. **Heading**: "OpenClaw Team Manager" -- 28px, weight 700, color `--color-accent`
2. **Subtext**: "Dashboard loading..." -- 14px, weight 400, color `--color-text-secondary`

### Purpose
This placeholder is replaced by the app shell in Phase 3. It exists solely to verify that Vite builds and serves React with Tailwind styling correctly. The executor should verify:
- Text renders in Inter font
- Background is `#0f1219` (not white -- no flash of unstyled content)
- Accent color `#00d4aa` displays correctly on the heading

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |

No shadcn initialization. No third-party registries. Phase 1 uses Tailwind utility classes directly. The project does not use shadcn -- it builds custom components with Tailwind starting in Phase 2.

---

## Interaction Contract

Phase 1 has exactly one interaction flow:

### Login Flow
1. User navigates to any route while unauthenticated
2. Devise redirects to `/users/sign_in` (ERB login page)
3. User enters email and password
4. User clicks "Sign In"
5. **Success**: Redirect to root path `/`, React app mounts, placeholder renders
6. **Failure**: Login page re-renders with error message, form fields preserved

No keyboard shortcuts. No animations. No transitions. No modals. No toasts. Those are Phase 2+.

---

## Accessibility Notes (Phase 1 minimum)

- Login form inputs have associated `<label>` elements (Devise generates these by default)
- Login button has sufficient color contrast: `#0f1219` text on `#00d4aa` background (contrast ratio 8.5:1, exceeds WCAG AA)
- Error messages are associated with form fields via `aria-describedby` or Devise's default error rendering
- `<html lang="en">` set in application layout
- Viewport meta tag present: `<meta name="viewport" content="width=device-width,initial-scale=1">`

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
