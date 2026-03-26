---
phase: 3
slug: app-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | RSpec (Rails) + Playwright (E2E via cypress-on-rails) |
| **Config file** | `source/dashboard/spec/spec_helper.rb`, `source/dashboard/spec/rails_helper.rb`, `source/dashboard/playwright.config.ts` |
| **Quick run command** | `cd source/dashboard && bundle exec rspec spec/requests` |
| **Full suite command** | `cd source/dashboard && bundle exec rspec && npx playwright test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd source/dashboard && bundle exec rspec spec/requests`
- **After every plan wave:** Run `cd source/dashboard && bundle exec rspec && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | SHEL-04 | request | `bundle exec rspec spec/requests/routing_spec.rb` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | SHEL-01 | e2e | `npx playwright test tests/e2e/sidebar.spec.ts` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | SHEL-02 | e2e | `npx playwright test tests/e2e/topbar.spec.ts` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | SHEL-03 | e2e | `npx playwright test tests/e2e/user_dropdown.spec.ts` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | SHEL-05 | e2e | `npx playwright test tests/e2e/responsive.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `spec/requests/routing_spec.rb` — stubs for catch-all route and SPA routing (SHEL-04)
- [ ] `tests/e2e/sidebar.spec.ts` — stubs for sidebar navigation and active states (SHEL-01)
- [ ] `tests/e2e/topbar.spec.ts` — stubs for breadcrumbs and search focus (SHEL-02)
- [ ] `tests/e2e/user_dropdown.spec.ts` — stubs for notification bell and user dropdown (SHEL-03)
- [ ] `tests/e2e/responsive.spec.ts` — stubs for mobile sidebar collapse (SHEL-05)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar collapse animation smoothness | SHEL-05 | Visual animation quality cannot be automated | Open app at mobile breakpoint, toggle sidebar, verify slide-in animation is smooth |
| Skeleton shimmer visual appearance | SHEL-04 | Visual placeholder quality is subjective | Navigate to each unbuilt route, verify skeleton blocks show shimmer animation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
