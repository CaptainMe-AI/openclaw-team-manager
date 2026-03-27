---
phase: 6
slug: task-board
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | RSpec (backend), Playwright via cypress-on-rails (E2E) |
| **Config file** | `source/dashboard/spec/rails_helper.rb`, `source/dashboard/playwright.config.ts` |
| **Quick run command** | `cd source/dashboard && bundle exec rspec spec/` |
| **Full suite command** | `cd source/dashboard && bundle exec rspec && npx playwright test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd source/dashboard && bundle exec rspec spec/`
- **After every plan wave:** Run `cd source/dashboard && bundle exec rspec && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | TASK-01, TASK-02, TASK-04 | unit/E2E | `cd source/dashboard && npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | TASK-03 | unit/E2E | `cd source/dashboard && npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | TASK-05, TASK-06, TASK-07 | unit/E2E | `cd source/dashboard && npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | NTSK-01, NTSK-02, NTSK-03, NTSK-04 | unit/E2E | `cd source/dashboard && npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements — RSpec and Playwright already configured from Phase 1.
- dnd-kit packages (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) must be installed before task execution.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop visual feedback | TASK-03 | Drag overlay rendering and smooth animation require visual inspection | Drag a task card between columns, verify overlay follows cursor and card snaps to new position |
| Priority color borders | TASK-04 | CSS color rendering requires visual inspection | Check P0 (red), P1 (amber), P2 (blue), P3 (gray) left borders on task cards |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
