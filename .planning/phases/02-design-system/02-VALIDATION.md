---
phase: 2
slug: design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | RSpec 8.0.4 + Playwright 1.58.2 |
| **Config file** | `source/dashboard/spec/rails_helper.rb` (RSpec), Playwright config TBD |
| **Quick run command** | `cd source/dashboard && npx tsc --noEmit` |
| **Full suite command** | `cd source/dashboard && npx playwright test tests/e2e/design_system.spec.ts` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd source/dashboard && npx tsc --noEmit`
- **After every plan wave:** Run `cd source/dashboard && npx playwright test tests/e2e/design_system.spec.ts`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | DSGN-01 | E2E (Playwright) | `cd source/dashboard && npx playwright test tests/e2e/design_system.spec.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | DSGN-02 | E2E (Playwright) | `cd source/dashboard && npx playwright test tests/e2e/design_system.spec.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | DSGN-03 | E2E (Playwright) | `cd source/dashboard && npx playwright test tests/e2e/design_system.spec.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | DSGN-04 | E2E (Playwright) | `cd source/dashboard && npx playwright test tests/e2e/design_system.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `source/dashboard/tests/e2e/design_system.spec.ts` — stubs for DSGN-01 through DSGN-04
- [ ] Playwright config for the project (verify cypress-on-rails Playwright setup from Phase 1)
- [ ] Component demo route/page for visual testing of all component variants

*Existing infrastructure covers RSpec. Playwright E2E stubs are needed for frontend-only validation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual fidelity to mockups | DSGN-01, DSGN-03 | Pixel-level visual comparison requires human eye | Compare component demo page against `designs/png/screenshot_*.png` |
| Font rendering quality | DSGN-02 | Font hinting/rendering varies by OS | Open app in browser, verify Inter and JetBrains Mono render without faux synthesis |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
