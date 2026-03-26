# Phase 2: Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 02-design-system
**Areas discussed:** Component architecture, Design fidelity, Component scope, Responsive strategy

---

## Component Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Typed React components | Standalone files with TypeScript props, cn() utility for class merging | ✓ |
| Tailwind-only patterns | Apply classes directly in screens, no component abstraction | |
| Copy-paste primitives | Document class patterns, copy-paste into screens as needed | |

**User's choice:** Typed React components
**Notes:** User selected preview showing Button.tsx with variant/size props and cn() utility pattern

---

## Design Fidelity

| Option | Description | Selected |
|--------|-------------|----------|
| Match closely, improve where needed | Follow mockup colors/spacing/layout, improve accessibility and interaction states | ✓ |
| Pixel-perfect reproduction | Recreate mockups exactly — same spacing, font sizes, element positions | |
| Loose inspiration | Use mockups for general direction, design fresh components | |

**User's choice:** Match closely, improve where needed
**Notes:** None

---

## Component Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Core set now, extend per-screen | Build 6 DSGN-03 components + cn() utility, add specialized ones in screen phases | ✓ |
| Full library upfront | Build all ~15 components visible in mockups now | |
| Minimal foundation | Just Button, Input, Card — build rest inline during screens | |

**User's choice:** Core set now, extend per-screen
**Notes:** None

---

## Responsive Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Desktop-first, adapt down | Design for desktop density, hide/stack/collapse for tablet and mobile | ✓ |
| Mobile-first, enhance up | Start from mobile, add columns and density as viewport grows | |
| Desktop-only with basic mobile | Focus on desktop, mobile gets simple stacked layout | |

**User's choice:** Desktop-first, adapt down
**Notes:** None

## Claude's Discretion

- Exact prop API design for each component
- Whether to add a component demo/preview page
- Additional theme tokens (shadows, spacing) from mockup analysis
- Animation/transition choices

## Deferred Ideas

- Sparkline, Modal, Dropdown, Charts, Kanban — deferred to screen phases
