---
phase: 7
slug: approvals
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | RSpec (backend), Playwright via cypress-on-rails (E2E) |
| **Config file** | `source/dashboard/spec/rails_helper.rb`, `source/dashboard/e2e/playwright.config.ts` |
| **Quick run command** | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/approvals_controller_spec.rb` |
| **Full suite command** | `cd source/dashboard && bundle exec rspec` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | APPR-06 | request | `bundle exec rspec spec/requests/api/v1/approvals_controller_spec.rb` | ✅ | ⬜ pending |
| 07-01-02 | 01 | 1 | APPR-01 | component | `npx playwright test` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 2 | APPR-01, APPR-02 | E2E | `npx playwright test` | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 2 | APPR-03 | E2E | `npx playwright test` | ❌ W0 | ⬜ pending |
| 07-02-03 | 02 | 2 | APPR-04, APPR-05 | E2E | `npx playwright test` | ❌ W0 | ⬜ pending |
| 07-02-04 | 02 | 2 | APPR-06, APPR-07 | E2E | `npx playwright test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing RSpec request specs cover backend — no new backend test stubs needed
- [ ] E2E test stubs for approval UI interactions (pending, to be created during execution)

*Existing infrastructure covers backend requirements. Frontend E2E stubs created during execution.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Expandable card animation | APPR-01 | Visual smoothness | Click approval card, verify expand/collapse animation |
| Approve/deny button colors | APPR-02 | Visual correctness | Verify green approve, red deny buttons render correctly |
| Detail panel layout | APPR-03 | Two-column layout visual | Expand card, verify reasoning left / context right |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
